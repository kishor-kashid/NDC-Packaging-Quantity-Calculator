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
import type { CalculationInput, NDC } from '$lib/types/index.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { drugName, ndc, sig, daysSupply } = body as CalculationInput;

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
		let rxcui;
		try {
			rxcui = await rxNormService.normalizeDrugInput({ drugName, ndc });
		} catch (error) {
			console.error('Normalization error details:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to normalize drug name';
			const errorDetails = error instanceof Error && 'details' in error ? error.details : undefined;
			
			return json(
				createFailedResponse({
					message: errorMessage,
					code: 'NORMALIZATION_ERROR',
					details: { 
						drugName, 
						ndc,
						originalError: errorDetails,
						suggestion: drugName 
							? 'Try checking the spelling, using the generic name, or providing an NDC code instead.'
							: 'Please provide either a drug name or NDC code.'
					}
				}),
				{ status: 400 }
			);
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

		// Step 3: Get NDCs for RxCUI
		let ndcCodes: string[] = [];
		try {
			ndcCodes = await rxNormService.getNDCsForRxCUI(rxcui);
		} catch (error) {
			console.warn('Failed to get NDCs from RxNorm, will try FDA search:', error);
		}

		// Step 4: Get FDA details for NDCs (limit to first 50 for performance)
		let availableNDCs: NDC[] = [];
		if (ndcCodes.length > 0) {
			const ndcPromises = ndcCodes.slice(0, 50).map((code) => fdaService.getNDCDetails(code));
			const ndcResults = await Promise.all(ndcPromises);
			availableNDCs = ndcResults.filter((ndc): ndc is NDC => ndc !== null);
		}

		// If no NDCs found, try searching FDA by drug name
		if (availableNDCs.length === 0 && finalDrugName) {
			try {
				const fdaNDCs = await fdaService.getNDCsByRxCUI(rxcui, finalDrugName);
				availableNDCs.push(...fdaNDCs);
			} catch (error) {
				console.warn('Failed to get NDCs from FDA:', error);
			}
		}

		// If still no NDCs, create a minimal result with calculated quantity
		if (availableNDCs.length === 0) {
			// Still calculate the quantity even without NDC data
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
			rxcui,
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

