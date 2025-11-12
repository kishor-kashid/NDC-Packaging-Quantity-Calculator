/**
 * API Route: /api/calculate
 * Complete calculation workflow: normalize → NDCs → calculate
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rxNormService } from '$lib/services/rxnorm.service.js';
import { fdaService } from '$lib/services/fda.service.js';
import { calculatorService } from '$lib/services/calculator.service.js';
import { validateCalculationInput } from '$lib/utils/index.js';
import { createSuccessResponse, createFailedResponse } from '$lib/utils/index.js';
import type { CalculationInput, NDC, RxCUI } from '$lib/types/index.js';

/**
 * Detects if a string is an NDC code (8-11 digits, with or without dashes)
 * NDC codes can be:
 * - 8 digits (4-4 format, e.g., 0591-0885) - product NDC without package code
 * - 9 digits (4-4-1 format, e.g., 591-0885-0)
 * - 10 digits (5-4-1 format, e.g., 0591-0885-0)
 * - 11 digits (5-4-2 format, e.g., 60760-861-90)
 */
function isNDCCode(input: string | undefined): boolean {
	if (!input) return false;
	const cleanInput = input.trim().replace(/[-\s]/g, '');
	// NDC should be 8, 9, 10, or 11 digits
	// Also check if it looks like an NDC format (mostly digits with optional dashes)
	if (/^\d{8,11}$/.test(cleanInput)) {
		return true;
	}
	// Check for NDC-like patterns with dashes (e.g., 0591-0885, 60760-861-90)
	// Pattern: 4-5 digits, dash, 3-4 digits, optional dash, 0-2 digits
	if (/^\d{4,5}-\d{3,4}(-\d{0,2})?$/.test(input.trim())) {
		return true;
	}
	return false;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		let { drugName, ndc, sig, daysSupply } = body as CalculationInput;

		// Auto-detect NDC code if drugName looks like an NDC
		if (drugName && !ndc && isNDCCode(drugName)) {
			ndc = drugName;
			drugName = undefined;
		}

		// Validate input
		const validationErrors = validateCalculationInput({ drugName, ndc, sig, daysSupply });
		if (validationErrors.length > 0) {
			return json(
				createFailedResponse({
					message: validationErrors[0].message,
					code: 'VALIDATION_ERROR',
					details: validationErrors
				}),
				{ status: 400 }
			);
		}

		// Step 1: Normalize drug name/NDC to RxCUI
		let rxcui: string | undefined;
		try {
			rxcui = await rxNormService.normalizeDrugInput({ drugName, ndc });
		} catch (error) {
			console.error('Normalization error details:', error);
			// If NDC lookup fails, try to get NDC details directly from FDA
			if (ndc) {
				console.log(`RxNorm lookup failed for NDC ${ndc}, trying FDA direct lookup...`);
				try {
					const ndcDetails = await fdaService.getNDCDetails(ndc);
					if (ndcDetails) {
						// We have NDC details from FDA, continue without RxCUI
						rxcui = undefined;
					} else {
						// NDC not found in FDA either
						return json(
							createFailedResponse({
								message: `NDC code not found: ${ndc}`,
								code: 'NDC_NOT_FOUND',
								details: { 
									ndc,
									suggestion: `The NDC code "${ndc}" was not found in the FDA database. Please verify the NDC code is correct, or try searching by drug name instead (e.g., "Lisinopril" or "Metformin").`
								}
							}),
							{ status: 400 }
						);
					}
				} catch (fdaError) {
					// FDA lookup also failed
					return json(
						createFailedResponse({
							message: `NDC code not found: ${ndc}`,
							code: 'NDC_NOT_FOUND',
							details: { 
								ndc,
								suggestion: `The NDC code "${ndc}" was not found in the FDA database. Please verify the NDC code is correct, or try searching by drug name instead (e.g., "Lisinopril" or "Metformin").`
							}
						}),
						{ status: 400 }
					);
				}
			} else {
				// Drug name normalization failed
				const errorMessage = error instanceof Error ? error.message : 'Failed to normalize drug name';
				const errorDetails = error instanceof Error && 'details' in error ? error.details : undefined;
				
				return json(
					createFailedResponse({
						message: errorMessage,
						code: 'NORMALIZATION_ERROR',
						details: { 
							drugName, 
							originalError: errorDetails,
							suggestion: 'Try checking the spelling, using the generic name, or providing an NDC code instead.'
						}
					}),
					{ status: 400 }
				);
			}
		}

		// Step 2: Get drug name if not provided
		let finalDrugName = drugName || '';
		if (!finalDrugName && ndc) {
			try {
				const result = await rxNormService.getRxCUIFromNDC(ndc);
				finalDrugName = ndc;
			} catch {
				finalDrugName = ndc || 'Unknown';
			}
		} else if (!finalDrugName) {
			try {
				const result = await rxNormService.getRxCUI(drugName || '');
				finalDrugName = result.name;
			} catch {
				finalDrugName = drugName || 'Unknown';
			}
		}

		// Step 3: Get NDCs for RxCUI (if we have one)
		let ndcCodes: string[] = [];
		if (rxcui) {
			try {
				ndcCodes = await rxNormService.getNDCsForRxCUI(rxcui);
			} catch (error) {
				console.warn('Failed to get NDCs from RxNorm, will try FDA search:', error);
			}
		}

		// Step 4: Get FDA details for NDCs (limit to first 50 for performance)
		let availableNDCs: NDC[] = [];
		
		// If we have a direct NDC input, try to get its details first
		if (ndc) {
			try {
				const ndcDetails = await fdaService.getNDCDetails(ndc);
				if (ndcDetails) {
					availableNDCs.push(ndcDetails);
				}
			} catch (error) {
				console.warn(`Failed to get details for NDC ${ndc}:`, error);
			}
		}
		
		// Also get NDCs from RxNorm if available
		if (ndcCodes.length > 0) {
			const ndcPromises = ndcCodes.slice(0, 50).map((code) => fdaService.getNDCDetails(code));
			const ndcResults = await Promise.all(ndcPromises);
			const newNDCs = ndcResults.filter((n): n is NDC => n !== null && !availableNDCs.some(existing => existing.ndc === n.ndc));
			availableNDCs.push(...newNDCs);
		}

		// If no NDCs found, try searching FDA by drug name
		if (availableNDCs.length === 0 && finalDrugName && rxcui) {
			try {
				const fdaNDCs = await fdaService.getNDCsByRxCUI(rxcui, finalDrugName);
				availableNDCs.push(...fdaNDCs);
			} catch (error) {
				console.warn('Failed to get NDCs from FDA:', error);
			}
		}

		// If still no NDCs found, check if an NDC was provided
		if (availableNDCs.length === 0) {
			// If an NDC was provided but not found, return an error (don't calculate)
			if (ndc) {
				return json(
					createFailedResponse({
						message: `NDC code not found: ${ndc}`,
						code: 'NDC_NOT_FOUND',
						details: { 
							ndc,
							suggestion: `The NDC code "${ndc}" was not found in the FDA database. Please verify the NDC code is correct, or try searching by drug name instead (e.g., "Lisinopril" or "Metformin").`
						}
					}),
					{ status: 400 }
				);
			}
			
			// If only drug name was provided (no NDC), still calculate the quantity as a fallback
			// This allows drug name searches to work even if no NDC packages are found
			const parsedSIG = calculatorService.parseSIG(sig!);
			const totalQuantity = calculatorService.calculateTotalQuantity(parsedSIG, daysSupply!);
			
			return json(
				createSuccessResponse({
					drugName: finalDrugName,
					rxcui,
					parsedSIG,
					totalQuantity,
					unit: parsedSIG.unit,
					daysSupply: daysSupply!,
					recommendations: [],
					availableNDCs: [],
					warnings: [{
						type: 'PACKAGE_MISMATCH' as any,
						message: 'No NDC packages found. Quantity calculated: ' + totalQuantity + ' ' + parsedSIG.unit,
						severity: 'medium'
					}],
					success: true
				}),
				{ status: 200 }
			);
		}

		// Step 5: Calculate quantity and select packages
		const calculationInput: CalculationInput = {
			drugName: finalDrugName,
			rxcui: rxcui as RxCUI | undefined,
			sig: sig!,
			daysSupply: daysSupply!
		};

		const result = await calculatorService.calculate(calculationInput, availableNDCs);

		return json(createSuccessResponse(result), { status: 200 });
	} catch (error) {
		console.error('Calculate API error:', error);
		return json(createFailedResponse(error), { status: 500 });
	}
};

