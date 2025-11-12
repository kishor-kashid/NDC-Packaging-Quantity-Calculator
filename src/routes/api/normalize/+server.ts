/**
 * API Route: /api/normalize
 * Normalizes drug name or NDC to RxCUI
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rxNormService } from '$lib/services/rxnorm.service.js';
import { validateDrugName, validateNDC, validateCalculationInput } from '$lib/utils/index.js';
import { createSuccessResponse, createFailedResponse } from '$lib/utils/index.js';
import type { DrugInput } from '$lib/types/index.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { drugName, ndc } = body as DrugInput;

		// Validate input
		const validationErrors = validateCalculationInput({ drugName, ndc, sig: 'temp', daysSupply: 1 });
		if (validationErrors.length > 0 && !drugName && !ndc) {
			return json(
				createFailedResponse({
					message: validationErrors[0].message,
					code: 'VALIDATION_ERROR',
					details: validationErrors
				}),
				{ status: 400 }
			);
		}

		// Validate individual fields
		if (drugName) {
			const error = validateDrugName(drugName);
			if (error) {
				return json(createFailedResponse(error), { status: 400 });
			}
		}

		if (ndc) {
			const error = validateNDC(ndc);
			if (error) {
				return json(createFailedResponse(error), { status: 400 });
			}
		}

		// Normalize drug input
		const rxcui = await rxNormService.normalizeDrugInput({ drugName, ndc });

		// Get full drug information
		let drugNameResult = drugName || '';
		if (!drugName && ndc) {
			// If only NDC provided, try to get drug name
			const result = await rxNormService.getRxCUIFromNDC(ndc);
			drugNameResult = ndc;
		} else if (drugName) {
			const result = await rxNormService.getRxCUI(drugName);
			drugNameResult = result.name;
		}

		return json(
			createSuccessResponse({
				rxcui,
				drugName: drugNameResult,
				normalized: true
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Normalize API error:', error);
		return json(createFailedResponse(error), { status: 500 });
	}
};

