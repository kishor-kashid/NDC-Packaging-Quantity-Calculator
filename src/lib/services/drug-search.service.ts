/**
 * Drug Search Service
 * Handles drug name autocomplete and search suggestions
 */

import { rxNormService } from './rxnorm.service.js';
import { handleAPIError, logError } from '../utils/index.js';
import type { DrugSuggestion } from '../types/filtering.types.js';

/**
 * Drug Search Service class
 */
export class DrugSearchService {
	private searchCache: Map<string, DrugSuggestion[]> = new Map();
	private readonly cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
	private cacheTimestamps: Map<string, number> = new Map();

	/**
	 * Searches for drug name suggestions
	 * @param query - Search query (partial drug name)
	 * @param limit - Maximum number of suggestions (default: 10)
	 * @returns List of drug suggestions
	 */
	async searchDrugNames(query: string, limit: number = 10): Promise<DrugSuggestion[]> {
		if (!query || query.trim().length < 2) {
			return [];
		}

		const normalizedQuery = query.trim().toLowerCase();
		const cacheKey = `${normalizedQuery}_${limit}`;

		// Check cache
		const cached = this.searchCache.get(cacheKey);
		const timestamp = this.cacheTimestamps.get(cacheKey);
		if (cached && timestamp && Date.now() - timestamp < this.cacheTTL) {
			return cached;
		}

		try {
			// Use RxNorm approximateTerm endpoint for suggestions
			const url = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=${limit}`;
			const response = await fetch(url);

			if (!response.ok) {
				return [];
			}

			const data = await response.json();
			const suggestions: DrugSuggestion[] = [];

			if (data.approximateGroup?.candidate) {
				for (const candidate of data.approximateGroup.candidate.slice(0, limit)) {
					if (candidate.rxcui && candidate.name) {
						suggestions.push({
							name: candidate.name,
							rxcui: candidate.rxcui,
							isBrand: candidate.name !== candidate.name.toLowerCase() // Simple heuristic
						});
					}
				}
			}

			// Cache results
			this.searchCache.set(cacheKey, suggestions);
			this.cacheTimestamps.set(cacheKey, Date.now());

			return suggestions;
		} catch (error) {
			logError(error, 'DrugSearchService.searchDrugNames');
			return [];
		}
	}

	/**
	 * Gets popular/common drug names
	 * @returns List of popular drug names
	 */
	getPopularDrugs(): DrugSuggestion[] {
		// Common medications list
		return [
			{ name: 'Lisinopril', isBrand: false },
			{ name: 'Metformin', isBrand: false },
			{ name: 'Atorvastatin', isBrand: false },
			{ name: 'Amlodipine', isBrand: false },
			{ name: 'Omeprazole', isBrand: false },
			{ name: 'Albuterol', isBrand: false },
			{ name: 'Gabapentin', isBrand: false },
			{ name: 'Sertraline', isBrand: false },
			{ name: 'Tramadol', isBrand: false },
			{ name: 'Trazodone', isBrand: false }
		];
	}

	/**
	 * Clears the search cache
	 */
	clearCache(): void {
		this.searchCache.clear();
		this.cacheTimestamps.clear();
	}
}

/**
 * Default drug search service instance
 */
export const drugSearchService = new DrugSearchService();

