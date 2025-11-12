/**
 * RxNorm API Service
 * Handles drug name normalization and NDC retrieval using RxNorm API
 */

import type {
	RxCUI,
	DrugInput,
	RxNormResponse,
	RxNormSearchResponse,
	RxNormNDCResponse
} from '../types/index.js';
import { handleAPIError, logError } from '../utils/index.js';

/**
 * Configuration for RxNorm API
 */
interface RxNormConfig {
	/** Base URL for RxNorm API */
	baseUrl?: string;
	/** API key (if required) */
	apiKey?: string;
	/** Request timeout in milliseconds */
	timeout?: number;
	/** Maximum retry attempts */
	maxRetries?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<RxNormConfig> = {
	baseUrl: 'https://rxnav.nlm.nih.gov/REST',
	apiKey: '',
	timeout: 2000, // 2 seconds as per requirements
	maxRetries: 2
};

/**
 * RxNorm API Service class
 */
export class RxNormService {
	private config: Required<RxNormConfig>;

	constructor(config?: RxNormConfig) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	/**
	 * Normalizes a drug name to RxCUI
	 * @param drugName - Drug name (brand or generic)
	 * @returns RxCUI code and normalized name
	 * @throws Error if normalization fails
	 */
	async getRxCUI(drugName: string): Promise<RxNormResponse> {
		try {
			// Try approximateTerm endpoint first (more reliable)
			let url = `${this.config.baseUrl}/approximateTerm.json?term=${encodeURIComponent(drugName)}&maxEntries=10`;
			let response = await this.fetchWithTimeout(url);

			// Log response for debugging
			if (process.env.NODE_ENV === 'development') {
				console.log('RxNorm API call (approximateTerm):', url);
				console.log('Response status:', response.status);
			}

			let data: RxNormSearchResponse | null = null;
			let rxcui: string | null = null;

			// If approximateTerm works, use it
			if (response.ok) {
				const approximateData = await response.json();
				if (approximateData.approximateGroup?.candidate?.length > 0) {
					// Get the first candidate's RxCUI
					const firstCandidate = approximateData.approximateGroup.candidate[0];
					if (firstCandidate.rxcui) {
						rxcui = firstCandidate.rxcui;
						// Store the approximate data for alternate names extraction
						data = approximateData as RxNormSearchResponse;
						if (process.env.NODE_ENV === 'development') {
							console.log('Found RxCUI from approximateTerm:', rxcui);
							console.log('Approximate data:', JSON.stringify(approximateData, null, 2));
						}
					}
				}
			}

			// If approximateTerm didn't work, try drugname endpoint
			if (!rxcui) {
				url = `${this.config.baseUrl}/drugname.json?name=${encodeURIComponent(drugName)}`;
				response = await this.fetchWithTimeout(url);

				if (process.env.NODE_ENV === 'development') {
					console.log('RxNorm API call (drugname):', url);
					console.log('Response status:', response.status);
				}

				// If 404, try the spelling suggestion endpoint
				if (response.status === 404) {
					const suggestionUrl = `${this.config.baseUrl}/spellingsuggestions.json?name=${encodeURIComponent(drugName)}`;
					const suggestionResponse = await this.fetchWithTimeout(suggestionUrl);
					
					if (suggestionResponse.ok) {
						const suggestionData = await suggestionResponse.json();
						if (suggestionData.suggestionGroup?.suggestionList?.suggestion?.length > 0) {
							// Try the first suggestion
							const suggestedName = suggestionData.suggestionGroup.suggestionList.suggestion[0];
							url = `${this.config.baseUrl}/drugname.json?name=${encodeURIComponent(suggestedName)}`;
							response = await this.fetchWithTimeout(url);
						}
					}
				}
			}

			// If we already got RxCUI from approximateTerm, skip parsing drugname response
			if (!rxcui) {
				if (!response.ok) {
					// Try to get error details from response
					let errorDetails = '';
					try {
						const errorData = await response.json();
						errorDetails = JSON.stringify(errorData);
					} catch {
						errorDetails = response.statusText;
					}

					if (response.status === 404) {
						throw new Error(`Drug "${drugName}" not found in RxNorm database. Please check the spelling or try a different drug name. Response: ${errorDetails}`);
					}
					throw new Error(`RxNorm API error: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
				}

				data = await response.json() as RxNormSearchResponse;

				// Log response data for debugging
				if (process.env.NODE_ENV === 'development') {
					console.log('RxNorm response data:', JSON.stringify(data, null, 2));
				}

				// Check if response indicates no results
				// RxNorm returns empty drugGroup when no results found
				if (!data.drugGroup) {
					throw new Error(`No RxCUI found for drug: ${drugName}. The drug may not be in the RxNorm database.`);
				}

				// Check for empty concept groups
				if (!data.drugGroup.conceptGroup || data.drugGroup.conceptGroup.length === 0) {
					throw new Error(`No RxCUI found for drug: ${drugName}. The drug may not be in the RxNorm database.`);
				}

				// Parse RxNorm response structure
				rxcui = this.extractRxCUIFromResponse(data);

				if (!rxcui) {
					throw new Error(`No RxCUI found for drug: ${drugName}. Please try a different drug name or check the spelling.`);
				}
			}

			// Extract alternate names if we have data
			const alternateNames = data ? this.extractAlternateNames(data) : [];

			return {
				rxcui: rxcui as RxCUI,
				name: drugName,
				alternateNames
			};
		} catch (error) {
			logError(error, 'RxNormService.getRxCUI');
			throw handleAPIError(error);
		}
	}

	/**
	 * Gets NDCs associated with an RxCUI
	 * @param rxcui - RxCUI code
	 * @returns List of NDC codes
	 * @throws Error if retrieval fails
	 */
	async getNDCsForRxCUI(rxcui: RxCUI): Promise<string[]> {
		try {
			const url = `${this.config.baseUrl}/rxcui/${rxcui}/ndcs.json`;
			const response = await this.fetchWithTimeout(url);

			if (process.env.NODE_ENV === 'development') {
				console.log('RxNorm getNDCsForRxCUI:', url);
				console.log('Response status:', response.status);
			}

			if (!response.ok) {
				// If 404, return empty array (no NDCs found for this RxCUI)
				if (response.status === 404) {
					if (process.env.NODE_ENV === 'development') {
						console.log(`No NDCs found for RxCUI: ${rxcui}`);
					}
					return [];
				}
				throw new Error(`RxNorm API error: ${response.status} ${response.statusText}`);
			}

			const data: RxNormNDCResponse = await response.json();

			if (process.env.NODE_ENV === 'development') {
				console.log('RxNorm NDC response:', JSON.stringify(data, null, 2));
			}

			return data.ndcList?.ndc || [];
		} catch (error) {
			logError(error, 'RxNormService.getNDCsForRxCUI');
			// Return empty array instead of throwing - NDCs might not be available
			if (process.env.NODE_ENV === 'development') {
				console.log('RxNorm getNDCsForRxCUI error (returning empty array):', error);
			}
			return [];
		}
	}

	/**
	 * Normalizes an NDC to RxCUI
	 * @param ndc - NDC code
	 * @returns RxCUI code
	 * @throws Error if normalization fails
	 */
	async getRxCUIFromNDC(ndc: string): Promise<RxCUI> {
		try {
			// Clean NDC format
			const cleanNDC = ndc.replace(/[-\s]/g, '');
			const url = `${this.config.baseUrl}/ndcstatus.json?ndc=${cleanNDC}`;
			const response = await this.fetchWithTimeout(url);

			if (!response.ok) {
				throw new Error(`RxNorm API error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();

			// Extract RxCUI from NDC status response
			const rxcui = data.ndcStatus?.rxcui;

			if (!rxcui) {
				throw new Error(`No RxCUI found for NDC: ${ndc}`);
			}

			return rxcui as RxCUI;
		} catch (error) {
			logError(error, 'RxNormService.getRxCUIFromNDC');
			throw handleAPIError(error);
		}
	}

	/**
	 * Normalizes drug input (name or NDC) to RxCUI
	 * @param input - Drug input (name or NDC)
	 * @returns RxCUI code
	 * @throws Error if normalization fails
	 */
	async normalizeDrugInput(input: DrugInput): Promise<RxCUI> {
		if (input.ndc) {
			try {
				return await this.getRxCUIFromNDC(input.ndc);
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Failed to normalize NDC';
				throw new Error(`${errorMsg}. NDC: ${input.ndc}`);
			}
		} else if (input.drugName) {
			try {
				const result = await this.getRxCUI(input.drugName);
				return result.rxcui;
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : 'Failed to normalize drug name';
				throw new Error(`${errorMsg}. Drug: ${input.drugName}`);
			}
		} else {
			throw new Error('Either drugName or ndc must be provided');
		}
	}

	/**
	 * Fetches with timeout and retry logic
	 * @param url - URL to fetch
	 * @param retries - Current retry attempt
	 * @returns Fetch response
	 */
	private async fetchWithTimeout(url: string, retries: number = 0): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

		try {
			const response = await fetch(url, {
				signal: controller.signal,
				headers: this.config.apiKey
					? {
							'Authorization': `Bearer ${this.config.apiKey}`,
							'Content-Type': 'application/json'
					  }
					: {
							'Content-Type': 'application/json'
					  }
			});

			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			clearTimeout(timeoutId);

			// Retry on timeout or network errors
			if (retries < this.config.maxRetries && (error instanceof Error && error.name === 'AbortError')) {
				return this.fetchWithTimeout(url, retries + 1);
			}

			throw error;
		}
	}

	/**
	 * Extracts RxCUI from RxNorm search response
	 * @param data - RxNorm search response
	 * @returns RxCUI code or null
	 */
	private extractRxCUIFromResponse(data: RxNormSearchResponse): string | null {
		if (!data.drugGroup?.conceptGroup) {
			return null;
		}

		// Look for the first available RxCUI
		for (const group of data.drugGroup.conceptGroup) {
			if (group.conceptProperties && group.conceptProperties.length > 0) {
				const firstConcept = group.conceptProperties[0];
				if (firstConcept.rxcui) {
					return firstConcept.rxcui;
				}
			}
		}

		return null;
	}

	/**
	 * Extracts alternate names from RxNorm response
	 * @param data - RxNorm search response
	 * @returns Array of alternate names
	 */
	private extractAlternateNames(data: RxNormSearchResponse | null): string[] {
		const names: string[] = [];

		if (!data) {
			return names;
		}

		// Extract from approximateGroup if available
		if (data.approximateGroup?.candidate) {
			for (const candidate of data.approximateGroup.candidate) {
				if (candidate.name && !names.includes(candidate.name)) {
					names.push(candidate.name);
				}
			}
		}

		// Extract from drugGroup if available
		if (data.drugGroup?.conceptGroup) {
			for (const group of data.drugGroup.conceptGroup) {
				if (group.conceptProperties) {
					for (const concept of group.conceptProperties) {
						if (concept.name && !names.includes(concept.name)) {
							names.push(concept.name);
						}
						if (concept.synonym && !names.includes(concept.synonym)) {
							names.push(concept.synonym);
						}
					}
				}
			}
		}

		return names;
	}
}

/**
 * Default RxNorm service instance
 */
export const rxNormService = new RxNormService({
	baseUrl: process.env.RXNORM_API_URL || DEFAULT_CONFIG.baseUrl,
	apiKey: process.env.RXNORM_API_KEY || DEFAULT_CONFIG.apiKey,
	timeout: DEFAULT_CONFIG.timeout,
	maxRetries: DEFAULT_CONFIG.maxRetries
});

