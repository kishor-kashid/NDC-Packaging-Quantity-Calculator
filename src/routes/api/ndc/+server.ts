/**
 * API Route: /api/ndc
 * Retrieves NDCs for a given RxCUI
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fdaService } from '$lib/services/fda.service.js';
import { rxNormService } from '$lib/services/rxnorm.service.js';
import { validateRxCUI } from '$lib/utils/index.js';
import { createSuccessResponse, createFailedResponse } from '$lib/utils/index.js';
import type { RxCUI } from '$lib/types/index.js';
import { NDCStatus } from '$lib/types/index.js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { rxcui, drugName } = body as { rxcui?: string; drugName?: string };

		if (!rxcui) {
			return json(
				createFailedResponse({
					message: 'RxCUI is required',
					code: 'VALIDATION_ERROR'
				}),
				{ status: 400 }
			);
		}

		// Validate RxCUI
		const error = validateRxCUI(rxcui);
		if (error) {
			return json(createFailedResponse(error), { status: 400 });
		}

		// Get NDCs from RxNorm
		const ndcCodes = await rxNormService.getNDCsForRxCUI(rxcui as RxCUI);

		// Get FDA details for each NDC
		const ndcPromises = ndcCodes.slice(0, 50).map((ndc) => fdaService.getNDCDetails(ndc));
		const ndcResults = await Promise.all(ndcPromises);

		// Filter out null results and inactive NDCs
		const activeNDCs = ndcResults.filter(
			(ndc) => ndc !== null && ndc.status === NDCStatus.ACTIVE
		);

		// If no active NDCs found via RxNorm, try searching FDA by drug name
		if (activeNDCs.length === 0 && drugName) {
			const fdaNDCs = await fdaService.getNDCsByRxCUI(rxcui, drugName);
			return json(
				createSuccessResponse({
					ndcs: fdaNDCs,
					total: fdaNDCs.length,
					activeCount: fdaNDCs.filter((n) => n.status === NDCStatus.ACTIVE).length
				}),
				{ status: 200 }
			);
		}

		return json(
			createSuccessResponse({
				ndcs: activeNDCs,
				total: ndcResults.length,
				activeCount: activeNDCs.length
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('NDC API error:', error);
		return json(createFailedResponse(error), { status: 500 });
	}
};

