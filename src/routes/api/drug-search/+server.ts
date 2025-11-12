/**
 * Drug Search API Endpoint
 * Provides autocomplete/search suggestions for drug names
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { drugSearchService } from '$lib/services/drug-search.service.js';
import { createSuccessResponse, createFailedResponse } from '$lib/utils/index.js';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const query = url.searchParams.get('q');
		const limit = parseInt(url.searchParams.get('limit') || '10', 10);

		if (!query || query.trim().length < 2) {
			return json(
				createSuccessResponse({
					suggestions: []
				}),
				{ status: 200 }
			);
		}

		const suggestions = await drugSearchService.searchDrugNames(query, limit);

		return json(
			createSuccessResponse({
				suggestions,
				query,
				count: suggestions.length
			}),
			{ status: 200 }
		);
	} catch (error) {
		console.error('Drug search error:', error);
		return json(
			createFailedResponse({
				message: 'Failed to search drug names',
				code: 'DRUG_SEARCH_ERROR',
				details: { error: error instanceof Error ? error.message : 'Unknown error' }
			}),
			{ status: 500 }
		);
	}
};

