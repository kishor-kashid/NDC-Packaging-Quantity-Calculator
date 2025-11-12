/**
 * Filtering Service
 * Handles dosage form and strength matching, filtering, and warnings
 */

import type { NDC } from '../types/ndc.types.js';
import type {
	DosageFormFilter,
	StrengthMatch,
	DosageFormMatch
} from '../types/filtering.types.js';
import { WarningType } from '../types/calculation.types.js';
import type { Warning } from '../types/calculation.types.js';

/**
 * Filtering Service class
 */
export class FilteringService {
	/**
	 * Extracts strength from drug name or NDC
	 * @param input - Drug name or NDC product name
	 * @returns Extracted strength information
	 */
	extractStrength(input: string): StrengthMatch {
		if (!input) {
			return { strength: null, matches: true };
		}

		// Common strength patterns: "20mg", "5mg/5ml", "10mg/1ml", "2.5mg", etc.
		const strengthPatterns = [
			/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?|iu|meq)\s*(?:\/\s*(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?|iu|meq))?/i,
			/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?|iu|meq)/i
		];

		for (const pattern of strengthPatterns) {
			const match = input.match(pattern);
			if (match) {
				const numericValue = parseFloat(match[1]);
				const unit = match[2]?.toLowerCase();
				const strength = match[0].trim();

				return {
					strength,
					matches: true,
					numericValue,
					unit
				};
			}
		}

		return { strength: null, matches: true };
	}

	/**
	 * Extracts dosage form from SIG or preference
	 * @param sig - SIG instructions
	 * @param preference - User preference (if any)
	 * @returns Dosage form filter
	 */
	extractDosageForm(sig: string, preference?: DosageFormFilter): DosageFormFilter {
		if (preference && preference !== 'ALL') {
			return preference;
		}

		if (!sig) {
			return null;
		}

		const normalized = sig.toLowerCase();

		// Check for dosage form indicators in SIG
		if (normalized.includes('tablet') || normalized.includes('tab')) {
			return 'TABLET';
		}
		if (normalized.includes('capsule') || normalized.includes('cap')) {
			return 'CAPSULE';
		}
		if (normalized.includes('liquid') || normalized.includes('ml') || normalized.includes('solution')) {
			return 'LIQUID';
		}
		if (normalized.includes('injection') || normalized.includes('inject') || normalized.includes('vial')) {
			return 'INJECTION';
		}
		if (normalized.includes('inhaler') || normalized.includes('puff')) {
			return 'INHALER';
		}
		if (normalized.includes('cream') || normalized.includes('ointment') || normalized.includes('gel')) {
			return 'TOPICAL';
		}
		if (normalized.includes('suppository')) {
			return 'SUPPOSITORY';
		}

		return null;
	}

	/**
	 * Normalizes dosage form string to filter type
	 * @param dosageForm - Dosage form string from FDA API
	 * @returns Normalized dosage form filter
	 */
	normalizeDosageForm(dosageForm: string | undefined): DosageFormFilter {
		if (!dosageForm) {
			return null;
		}

		const normalized = dosageForm.toUpperCase();

		if (normalized.includes('TABLET')) {
			return 'TABLET';
		}
		if (normalized.includes('CAPSULE')) {
			return 'CAPSULE';
		}
		if (normalized.includes('LIQUID') || normalized.includes('SOLUTION') || normalized.includes('SUSPENSION')) {
			return 'LIQUID';
		}
		if (normalized.includes('INJECTION') || normalized.includes('INJECTABLE')) {
			return 'INJECTION';
		}
		if (normalized.includes('INHALER') || normalized.includes('INHALATION')) {
			return 'INHALER';
		}
		if (normalized.includes('CREAM') || normalized.includes('OINTMENT') || normalized.includes('GEL')) {
			return 'TOPICAL';
		}
		if (normalized.includes('SUPPOSITORY')) {
			return 'SUPPOSITORY';
		}

		return null;
	}

	/**
	 * Checks if NDC dosage form matches preferred form
	 * @param ndc - NDC to check
	 * @param preferredForm - Preferred dosage form
	 * @returns Dosage form match information
	 */
	checkDosageFormMatch(ndc: NDC, preferredForm: DosageFormFilter | null): DosageFormMatch {
		if (!preferredForm || preferredForm === 'ALL') {
			return {
				preferredForm: null,
				matches: true,
				warningLevel: 'none'
			};
		}

		const ndcForm = this.normalizeDosageForm(ndc.dosageForm);

		if (!ndcForm) {
			return {
				preferredForm,
				matches: false,
				warningLevel: 'low'
			};
		}

		const matches = ndcForm === preferredForm;

		return {
			preferredForm,
			matches,
			warningLevel: matches ? 'none' : 'medium'
		};
	}

	/**
	 * Checks if NDC strength matches expected strength
	 * @param ndc - NDC to check
	 * @param expectedStrength - Expected strength (from drug name or user input)
	 * @returns Strength match information
	 */
	checkStrengthMatch(ndc: NDC, expectedStrength: StrengthMatch | null): StrengthMatch {
		if (!expectedStrength || !expectedStrength.strength) {
			return { strength: null, matches: true };
		}

		if (!ndc.strength) {
			return {
				strength: expectedStrength.strength,
				matches: false
			};
		}

		// Normalize strengths for comparison
		const ndcStrength = this.extractStrength(ndc.strength);
		const matches = 
			ndcStrength.numericValue === expectedStrength.numericValue &&
			ndcStrength.unit === expectedStrength.unit;

		return {
			strength: expectedStrength.strength,
			matches,
			numericValue: expectedStrength.numericValue,
			unit: expectedStrength.unit
		};
	}

	/**
	 * Filters NDCs by dosage form
	 * @param ndcs - List of NDCs
	 * @param dosageForm - Dosage form filter
	 * @returns Filtered NDCs
	 */
	filterByDosageForm(ndcs: NDC[], dosageForm: DosageFormFilter): NDC[] {
		if (!dosageForm || dosageForm === 'ALL') {
			return ndcs;
		}

		return ndcs.filter((ndc) => {
			const ndcForm = this.normalizeDosageForm(ndc.dosageForm);
			return ndcForm === dosageForm;
		});
	}

	/**
	 * Filters NDCs by strength
	 * @param ndcs - List of NDCs
	 * @param strength - Strength filter (e.g., "20mg")
	 * @returns Filtered NDCs
	 */
	filterByStrength(ndcs: NDC[], strength: string | null): NDC[] {
		if (!strength) {
			return ndcs;
		}

		const expectedStrength = this.extractStrength(strength);
		if (!expectedStrength.strength) {
			return ndcs;
		}

		return ndcs.filter((ndc) => {
			if (!ndc.strength) {
				return false;
			}
			const ndcStrength = this.extractStrength(ndc.strength);
			return (
				ndcStrength.numericValue === expectedStrength.numericValue &&
				ndcStrength.unit === expectedStrength.unit
			);
		});
	}

	/**
	 * Generates warnings for dosage form mismatches
	 * @param ndcs - List of NDCs
	 * @param preferredForm - Preferred dosage form
	 * @returns List of warnings
	 */
	generateDosageFormWarnings(ndcs: NDC[], preferredForm: DosageFormFilter | null): Warning[] {
		if (!preferredForm || preferredForm === 'ALL') {
			return [];
		}

		const warnings: Warning[] = [];
		const mismatchedNDCs = ndcs.filter((ndc) => {
			const match = this.checkDosageFormMatch(ndc, preferredForm);
			return !match.matches;
		});

		if (mismatchedNDCs.length > 0) {
			warnings.push({
				type: WarningType.DOSAGE_FORM_MISMATCH,
				message: `${mismatchedNDCs.length} NDC(s) have dosage form mismatch. Preferred: ${preferredForm}`,
				severity: 'medium',
				details: {
					preferredForm,
					mismatchedNDCs: mismatchedNDCs.map((n) => ({
						ndc: n.ndc,
						dosageForm: n.dosageForm
					}))
				}
			});
		}

		return warnings;
	}

	/**
	 * Generates warnings for strength mismatches
	 * @param ndcs - List of NDCs
	 * @param expectedStrength - Expected strength
	 * @returns List of warnings
	 */
	generateStrengthWarnings(ndcs: NDC[], expectedStrength: StrengthMatch | null): Warning[] {
		if (!expectedStrength || !expectedStrength.strength) {
			return [];
		}

		const warnings: Warning[] = [];
		const mismatchedNDCs = ndcs.filter((ndc) => {
			const match = this.checkStrengthMatch(ndc, expectedStrength);
			return !match.matches;
		});

		if (mismatchedNDCs.length > 0) {
			warnings.push({
				type: WarningType.STRENGTH_MISMATCH,
				message: `${mismatchedNDCs.length} NDC(s) have strength mismatch. Expected: ${expectedStrength.strength}`,
				severity: 'medium',
				details: {
					expectedStrength: expectedStrength.strength,
					mismatchedNDCs: mismatchedNDCs.map((n) => ({
						ndc: n.ndc,
						strength: n.strength
					}))
				}
			});
		}

		return warnings;
	}
}

/**
 * Default filtering service instance
 */
export const filteringService = new FilteringService();

