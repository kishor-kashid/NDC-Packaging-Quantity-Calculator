/**
 * Quantity Calculator Service
 * Handles SIG parsing, quantity calculation, and package selection
 */

import type {
	CalculationInput,
	CalculationResult,
	ParsedSIG,
	DispenseRecommendation,
	Warning,
	WarningType,
	NDC,
	DosageForm
} from '../types/index.js';
import { WarningType as WT, DosageForm as DF } from '../types/index.js';
import { NDCStatus } from '../types/index.js';
import { handleAPIError, logError } from '../utils/index.js';

/**
 * Calculator Service class
 */
export class CalculatorService {
	/**
	 * Parses SIG (dosing instructions) to extract dose, frequency, and units
	 * Uses enhanced SIG parser service for complex patterns
	 * @param sig - SIG string (e.g., "Take 1 tablet by mouth twice daily")
	 * @returns Parsed SIG object
	 */
	async parseSIG(sig: string): Promise<ParsedSIG> {
		// Import here to avoid circular dependency
		const { sigParserService } = await import('./sig-parser.service.js');
		return await sigParserService.parseSIG(sig);
	}

	/**
	 * Calculates total quantity needed based on SIG and days' supply
	 * Handles complex schedules, PRN, and tapering
	 * @param parsedSIG - Parsed SIG object
	 * @param daysSupply - Days' supply
	 * @returns Total quantity needed
	 */
	calculateTotalQuantity(parsedSIG: ParsedSIG, daysSupply: number): number {
		// Handle PRN (as needed) - use average dose estimate
		if (parsedSIG.prn) {
			const avgDose = parsedSIG.averageDailyDose || parsedSIG.dose;
			// For PRN, estimate 50% of maximum frequency (conservative estimate)
			const estimatedFrequency = parsedSIG.frequency > 0 ? parsedSIG.frequency * 0.5 : 2;
			return Math.ceil(avgDose * estimatedFrequency * daysSupply);
		}

		// Handle complex schedules
		if (parsedSIG.isComplex && parsedSIG.schedule && parsedSIG.schedule.length > 0) {
			let totalQuantity = 0;

			for (const entry of parsedSIG.schedule) {
				// Check if entry has day range
				if (entry.dayRange) {
					// Parse day range (e.g., "day 1", "days 1-3", "days 2+")
					const dayRange = this.parseDayRange(entry.dayRange, daysSupply);
					const daysForEntry = dayRange.end - dayRange.start + 1;
					
					if (daysForEntry > 0) {
						totalQuantity += entry.dose * entry.frequency * daysForEntry;
					}
				} else {
					// Regular schedule entry - apply to all days
					totalQuantity += entry.dose * entry.frequency * daysSupply;
				}
			}

			return totalQuantity;
		}

		// Simple calculation
		return parsedSIG.dose * parsedSIG.frequency * daysSupply;
	}

	/**
	 * Parses day range string (e.g., "day 1", "days 1-3", "days 2+")
	 * @param dayRange - Day range string
	 * @param totalDays - Total days supply
	 * @returns Start and end day numbers
	 */
	private parseDayRange(dayRange: string, totalDays: number): { start: number; end: number } {
		const normalized = dayRange.toLowerCase().trim();

		// Pattern: "day 1"
		const singleDayMatch = normalized.match(/day\s+(\d+)/);
		if (singleDayMatch) {
			const day = parseInt(singleDayMatch[1], 10);
			return { start: day, end: day };
		}

		// Pattern: "days 1-3"
		const rangeMatch = normalized.match(/days?\s+(\d+)\s*-\s*(\d+)/);
		if (rangeMatch) {
			return {
				start: parseInt(rangeMatch[1], 10),
				end: parseInt(rangeMatch[2], 10)
			};
		}

		// Pattern: "days 2+" or "day 2 onwards"
		const onwardsMatch = normalized.match(/days?\s+(\d+)\s*\+/);
		if (onwardsMatch) {
			return {
				start: parseInt(onwardsMatch[1], 10),
				end: totalDays
			};
		}

		// Default: apply to all days
		return { start: 1, end: totalDays };
	}

	/**
	 * Selects optimal NDC packages to meet quantity requirements
	 * @param totalQuantity - Total quantity needed
	 * @param unit - Unit of measurement
	 * @param availableNDCs - List of available NDCs
	 * @returns List of recommended packages
	 */
	selectOptimalPackages(
		totalQuantity: number,
		unit: string,
		availableNDCs: NDC[]
	): DispenseRecommendation[] {
		// Filter to active NDCs with matching units
		const activeNDCs = availableNDCs.filter(
			(ndc) =>
				ndc.status === NDCStatus.ACTIVE &&
				ndc.packageInfo &&
				this.matchesUnit(ndc.packageInfo.unit, unit)
		);

		if (activeNDCs.length === 0) {
			return [];
		}

		// Sort by package size (ascending)
		const sortedNDCs = [...activeNDCs].sort((a, b) => {
			const sizeA = a.packageInfo?.quantity || 0;
			const sizeB = b.packageInfo?.quantity || 0;
			return sizeA - sizeB;
		});

		const recommendations: DispenseRecommendation[] = [];

		// Try to find exact match first
		const exactMatch = sortedNDCs.find((ndc) => {
			const packageSize = ndc.packageInfo?.quantity || 0;
			return packageSize === totalQuantity;
		});

		if (exactMatch && exactMatch.packageInfo && exactMatch.packageInfo.quantity !== undefined) {
			recommendations.push({
				ndc: exactMatch,
				packageCount: 1,
				totalQuantity: exactMatch.packageInfo.quantity,
				unit: exactMatch.packageInfo.unit,
				exactMatch: true,
				variancePercentage: 0
			});
			return recommendations;
		}

		// Find best single package match
		let bestMatch: DispenseRecommendation | null = null;
		let bestVariance = Infinity;

		for (const ndc of sortedNDCs) {
			if (!ndc.packageInfo || ndc.packageInfo.quantity === undefined) continue;

			const packageSize = ndc.packageInfo.quantity;
			const packagesNeeded = Math.ceil(totalQuantity / packageSize);
			const totalFromPackages = packagesNeeded * packageSize;
			const variance = totalFromPackages - totalQuantity;
			const variancePercent = (variance / totalQuantity) * 100;

			// Prefer packages that minimize waste
			if (variance >= 0 && variancePercent < bestVariance) {
				bestVariance = variancePercent;
				bestMatch = {
					ndc,
					packageCount: packagesNeeded,
					totalQuantity: totalFromPackages,
					unit: ndc.packageInfo.unit,
					exactMatch: variance === 0,
					overfill: variance > 0 ? variance : undefined,
					variancePercentage: variancePercent
				};
			}
		}

		// If no single package works well, try combinations
		if (!bestMatch || bestVariance > 20) {
			const combination = this.findOptimalCombination(totalQuantity, sortedNDCs);
			if (combination.length > 0) {
				return combination;
			}
		}

		if (bestMatch) {
			recommendations.push(bestMatch);
		}

		return recommendations;
	}

	/**
	 * Detects overfill/underfill situations
	 * @param recommendations - Package recommendations
	 * @param totalQuantity - Required total quantity
	 * @returns Array of warnings
	 */
	detectOverfillUnderfill(
		recommendations: DispenseRecommendation[],
		totalQuantity: number
	): Warning[] {
		const warnings: Warning[] = [];

		for (const rec of recommendations) {
			if (rec.overfill) {
				const overfillPercent = rec.variancePercentage || 0;
				warnings.push({
					type: WT.OVERFILL,
					message: `Overfill detected: ${rec.overfill} ${rec.unit} (${overfillPercent.toFixed(1)}% more than needed)`,
					severity: overfillPercent > 20 ? 'high' : overfillPercent > 10 ? 'medium' : 'low',
					details: {
						recommendation: rec,
						overfillAmount: rec.overfill,
						overfillPercent: overfillPercent
					}
				});
			}

			if (rec.underfill) {
				const underfillPercent = Math.abs(rec.variancePercentage || 0);
				warnings.push({
					type: WT.UNDERFILL,
					message: `Underfill detected: ${rec.underfill} ${rec.unit} (${underfillPercent.toFixed(1)}% less than needed)`,
					severity: underfillPercent > 20 ? 'high' : underfillPercent > 10 ? 'medium' : 'low',
					details: {
						recommendation: rec,
						underfillAmount: rec.underfill,
						underfillPercent: underfillPercent
					}
				});
			}
		}

		return warnings;
	}

	/**
	 * Handles special dosage forms (liquids, inhalers, insulin)
	 * @param dosageForm - Dosage form type
	 * @param parsedSIG - Parsed SIG
	 * @param totalQuantity - Calculated total quantity
	 * @returns Adjusted quantity and warnings
	 */
	handleSpecialDosageForms(
		dosageForm: DosageForm,
		parsedSIG: ParsedSIG,
		totalQuantity: number
	): { adjustedQuantity: number; warnings: Warning[] } {
		const warnings: Warning[] = [];

		switch (dosageForm) {
			case DF.LIQUID:
				// Liquids are typically measured in ml
				// Ensure unit is ml
				if (parsedSIG.unit !== 'ml') {
					warnings.push({
						type: WT.PACKAGE_MISMATCH,
						message: 'Liquid medication detected - ensure quantity is in ml',
						severity: 'medium'
					});
				}
				break;

			case DF.INHALER:
				// Inhalers are typically measured in puffs
				if (parsedSIG.unit !== 'puff' && parsedSIG.unit !== 'puffs') {
					warnings.push({
						type: WT.PACKAGE_MISMATCH,
						message: 'Inhaler detected - ensure quantity is in puffs',
						severity: 'medium'
					});
				}
				break;

			case DF.INSULIN:
				// Insulin is typically measured in units
				if (parsedSIG.unit !== 'unit' && parsedSIG.unit !== 'units') {
					warnings.push({
						type: WT.PACKAGE_MISMATCH,
						message: 'Insulin detected - ensure quantity is in units',
						severity: 'high'
					});
				}
				break;
		}

		return {
			adjustedQuantity: totalQuantity,
			warnings
		};
	}

	/**
	 * Performs complete calculation workflow
	 * @param input - Calculation input
	 * @param availableNDCs - Available NDCs (from FDA service)
	 * @returns Complete calculation result
	 */
	async calculate(
		input: CalculationInput,
		availableNDCs: NDC[]
	): Promise<CalculationResult> {
		try {
			// Parse SIG (now async)
			const parsedSIG = await this.parseSIG(input.sig);

			// Calculate total quantity
			const totalQuantity = this.calculateTotalQuantity(parsedSIG, input.daysSupply);

			// Select optimal packages
			const recommendations = this.selectOptimalPackages(
				totalQuantity,
				parsedSIG.unit,
				availableNDCs
			);

			// Detect warnings
			const warnings: Warning[] = [];

			// Overfill/underfill warnings
			warnings.push(...this.detectOverfillUnderfill(recommendations, totalQuantity));

			// Inactive NDC warnings
			const inactiveNDCs = availableNDCs.filter((ndc) => ndc.status === NDCStatus.INACTIVE);
			if (inactiveNDCs.length > 0) {
				warnings.push({
					type: WT.INACTIVE_NDC,
					message: `${inactiveNDCs.length} inactive NDC(s) found in results`,
					severity: 'high',
					details: { inactiveNDCs: inactiveNDCs.map((n) => n.ndc) }
				});
			}

			// Unusual quantity warning
			if (totalQuantity > 1000) {
				warnings.push({
					type: WT.UNUSUAL_QUANTITY,
					message: `Unusually large quantity detected: ${totalQuantity} ${parsedSIG.unit}`,
					severity: 'medium',
					details: { quantity: totalQuantity, unit: parsedSIG.unit }
				});
			}

			return {
				drugName: input.drugName || input.ndc || 'Unknown',
				rxcui: input.rxcui!,
				parsedSIG,
				totalQuantity,
				unit: parsedSIG.unit,
				daysSupply: input.daysSupply,
				recommendations,
				availableNDCs,
				warnings,
				success: true
			};
		} catch (error) {
			logError(error, 'CalculatorService.calculate');
			throw handleAPIError(error);
		}
	}

	/**
	 * Normalizes unit name
	 * @param unit - Unit string
	 * @returns Normalized unit
	 */
	private normalizeUnit(unit: string): string {
		const normalized = unit.toLowerCase();
		const unitMap: Record<string, string> = {
			tablet: 'tablet',
			tab: 'tablet',
			tablets: 'tablet',
			capsule: 'capsule',
			cap: 'capsule',
			capsules: 'capsule',
			ml: 'ml',
			mg: 'mg',
			g: 'g',
			unit: 'unit',
			units: 'unit',
			puff: 'puff',
			puffs: 'puff',
			dose: 'dose',
			doses: 'dose'
		};

		return unitMap[normalized] || normalized;
	}

	/**
	 * Checks if units match
	 * @param unit1 - First unit
	 * @param unit2 - Second unit
	 * @returns True if units match
	 */
	private matchesUnit(unit1: string, unit2: string): boolean {
		const normalized1 = this.normalizeUnit(unit1);
		const normalized2 = this.normalizeUnit(unit2);
		return normalized1 === normalized2;
	}

	/**
	 * Finds optimal combination of packages
	 * @param totalQuantity - Required quantity
	 * @param ndcs - Available NDCs
	 * @returns Optimal combination
	 */
	private findOptimalCombination(
		totalQuantity: number,
		ndcs: NDC[]
	): DispenseRecommendation[] {
		// Simplified combination algorithm
		// In production, this could use dynamic programming for optimal solution
		const recommendations: DispenseRecommendation[] = [];
		let remaining = totalQuantity;

		// Sort by package size (descending) for greedy approach
		const sorted = [...ndcs]
			.filter((ndc) => ndc.packageInfo && ndc.status === NDCStatus.ACTIVE)
			.sort((a, b) => (b.packageInfo?.quantity || 0) - (a.packageInfo?.quantity || 0));

		for (const ndc of sorted) {
			if (!ndc.packageInfo || ndc.packageInfo.quantity === undefined || remaining <= 0) break;

			const packageSize = ndc.packageInfo.quantity;
			const packagesNeeded = Math.floor(remaining / packageSize);

			if (packagesNeeded > 0) {
				recommendations.push({
					ndc,
					packageCount: packagesNeeded,
					totalQuantity: packagesNeeded * packageSize,
					unit: ndc.packageInfo.unit,
					exactMatch: false,
					overfill: packagesNeeded * packageSize - remaining,
					variancePercentage: ((packagesNeeded * packageSize - remaining) / totalQuantity) * 100
				});

				remaining -= packagesNeeded * packageSize;
			}
		}

		return recommendations;
	}
}

/**
 * Default calculator service instance
 */
export const calculatorService = new CalculatorService();

