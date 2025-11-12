/**
 * FDA NDC Directory API Service
 * Handles NDC information retrieval from FDA NDC Directory
 */

import type { NDC, FDAResponse, PackageInfo } from '../types/index.js';
import { NDCStatus } from '../types/index.js';
import { handleAPIError, logError } from '../utils/index.js';
import { formatNDC } from '../utils/index.js';

/**
 * Configuration for FDA API
 */
interface FDAConfig {
	/** Base URL for FDA API */
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
const DEFAULT_CONFIG: Required<FDAConfig> = {
	baseUrl: 'https://api.fda.gov/drug/ndc.json',
	apiKey: '',
	timeout: 2000, // 2 seconds as per requirements
	maxRetries: 2
};

/**
 * Note: FDA API may require API key for production use
 * For development, the public API has rate limits
 * See: https://open.fda.gov/apis/
 */

/**
 * FDA NDC Directory Service class
 */
export class FDAService {
	private config: Required<FDAConfig>;

	constructor(config?: FDAConfig) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	/**
	 * Gets NDC details by NDC code
	 * @param ndc - NDC code
	 * @returns NDC information
	 * @throws Error if retrieval fails
	 */
	async getNDCDetails(ndc: string): Promise<NDC | null> {
		try {
			const cleanNDC = ndc.replace(/[-\s]/g, '');
			// Try searching by ndc_package_code first (this gives package-level info with package_description)
			let url = `${this.config.baseUrl}?search=ndc_package_code:"${cleanNDC}"&limit=1`;
			let response = await this.fetchWithTimeout(url);

			// If that doesn't work, try product_ndc
			if (!response.ok || response.status === 404) {
				url = `${this.config.baseUrl}?search=product_ndc:"${cleanNDC}"&limit=1`;
				response = await this.fetchWithTimeout(url);
			}

			if (!response.ok) {
				if (response.status === 404) {
					return null;
				}
				throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
			}

			const data: FDAResponse = await response.json();

			if (!data.results || data.results.length === 0) {
				return null;
			}

			const result = data.results[0];
			
			// Log in development to see what we're getting
			if (process.env.NODE_ENV === 'development') {
				console.log('FDA getNDCDetails response:', {
					ndc: cleanNDC,
					hasPackageDescription: !!result.package_description,
					packageDescription: result.package_description,
					hasPackaging: !!(result as any).packaging,
					ndcPackageCode: result.ndc_package_code,
					productNdc: result.product_ndc,
					allKeys: Object.keys(result)
				});
			}

			return this.parseFDAResponse(result, cleanNDC, undefined);
		} catch (error) {
			logError(error, 'FDAService.getNDCDetails');
			throw handleAPIError(error);
		}
	}

	/**
	 * Gets packaging information for an NDC
	 * @param ndc - NDC code
	 * @returns Package information
	 * @throws Error if retrieval fails
	 */
	async getPackagingInfo(ndc: string): Promise<PackageInfo | null> {
		try {
			const ndcDetails = await this.getNDCDetails(ndc);
			return ndcDetails?.packageInfo || null;
		} catch (error) {
			logError(error, 'FDAService.getPackagingInfo');
			throw handleAPIError(error);
		}
	}

	/**
	 * Gets package information for a product by searching for packages with that product_ndc
	 * The FDA API returns both product-level and package-level records when searching by product_ndc.
	 * Package-level records have package_description, product-level don't.
	 * @param productNdc - Product NDC code
	 * @returns NDC with package information (first package found)
	 */
	private async getPackageInfoForProduct(productNdc: string): Promise<NDC | null> {
		try {
			const cleanNDC = productNdc.replace(/[-\s]/g, '');
			// Search for packages with this product_ndc - this should return both product and package level records
			// We want the package-level ones which have package_description
			const url = `${this.config.baseUrl}?search=product_ndc:"${cleanNDC}"&limit=50`;
			const response = await this.fetchWithTimeout(url);

			if (!response.ok) {
				if (response.status === 404) {
					return null;
				}
				throw new Error(`FDA API error: ${response.status} ${response.statusText}`);
			}

			const data: FDAResponse = await response.json();

			if (!data.results || data.results.length === 0) {
				return null;
			}

			if (process.env.NODE_ENV === 'development') {
				console.log(`Searching for packages with product_ndc ${cleanNDC}, found ${data.results.length} results`);
			}

			// Find the first result that has package information
			// Check both legacy package_description and modern packaging array
			for (const result of data.results) {
				// Check for packaging array (modern structure)
				if (result.packaging && Array.isArray(result.packaging) && result.packaging.length > 0) {
					const firstPackage = result.packaging[0];
					if (firstPackage.description) {
						if (process.env.NODE_ENV === 'development') {
							console.log(`Found package-level record with packaging array: ${firstPackage.description}`);
						}
						// Use package_ndc from packaging array if available, otherwise use product_ndc
						const ndcCode = firstPackage.package_ndc || result.product_ndc || cleanNDC;
						const ndc = this.parseFDAResponse(result, ndcCode, undefined);
						if (ndc && ndc.packageInfo) {
							return ndc;
						}
					}
				}
				// Also check legacy package_description field
				else if (result.package_description) {
					if (process.env.NODE_ENV === 'development') {
						console.log(`Found package-level record with package_description: ${result.package_description}`);
					}
					// Use ndc_package_code if available (package-level identifier), otherwise use product_ndc
					const ndcCode = result.ndc_package_code || result.product_ndc || cleanNDC;
					const ndc = this.parseFDAResponse(result, ndcCode, undefined);
					if (ndc && ndc.packageInfo) {
						return ndc;
					}
				}
			}

			// If no package information found in any result, log for debugging
			if (process.env.NODE_ENV === 'development') {
				console.log(`No package information found in any of ${data.results.length} results for product_ndc ${cleanNDC}`);
				if (data.results.length > 0) {
					const sample = data.results[0];
					console.log('Sample result structure:', {
						hasPackageDescription: !!sample.package_description,
						hasPackagingArray: !!(sample.packaging && Array.isArray(sample.packaging) && sample.packaging.length > 0),
						packagingArrayLength: sample.packaging?.length || 0,
						ndcPackageCode: sample.ndc_package_code,
						productNdc: sample.product_ndc,
						allKeys: Object.keys(sample)
					});
				}
			}

			return null;
		} catch (error) {
			logError(error, 'FDAService.getPackageInfoForProduct');
			return null; // Don't throw - just return null
		}
	}

	/**
	 * Checks if an NDC is active
	 * @param ndc - NDC code
	 * @returns True if active, false if inactive
	 * @throws Error if check fails
	 */
	async checkNDCStatus(ndc: string): Promise<NDCStatus> {
		try {
			const ndcDetails = await this.getNDCDetails(ndc);

			if (!ndcDetails) {
				return NDCStatus.UNKNOWN;
			}

			return ndcDetails.status;
		} catch (error) {
			logError(error, 'FDAService.checkNDCStatus');
			throw handleAPIError(error);
		}
	}

	/**
	 * Gets NDCs by RxCUI (searches by product name)
	 * Note: This is a simplified implementation. In production, you might need
	 * to use RxNorm to get NDCs, then validate with FDA.
	 * @param rxcui - RxCUI code
	 * @param drugName - Drug name for searching (used as fallback for product name)
	 * @returns List of NDCs
	 * @throws Error if retrieval fails
	 */
	async getNDCsByRxCUI(rxcui: string, drugName: string): Promise<NDC[]> {
		try {
			// Search FDA API by drug name - try multiple search strategies
			const searchTerm = encodeURIComponent(drugName);
			
			// Try different search patterns
			const searchPatterns = [
				`proprietary_name:"${searchTerm}"`,
				`non_proprietary_name:"${searchTerm}"`,
				`proprietary_name:${searchTerm}`,
				`non_proprietary_name:${searchTerm}`,
				`brand_name:"${searchTerm}"`,
				`generic_name:"${searchTerm}"`
			];

			for (const pattern of searchPatterns) {
				const url = `${this.config.baseUrl}?search=${pattern}&limit=100`;
				const response = await this.fetchWithTimeout(url);

				// If 404, try next pattern
				if (response.status === 404) {
					if (process.env.NODE_ENV === 'development') {
						console.log(`FDA search pattern failed (404): ${pattern}`);
					}
					continue;
				}

				if (!response.ok) {
					if (process.env.NODE_ENV === 'development') {
						console.log(`FDA search pattern failed (${response.status}): ${pattern}`);
					}
					continue;
				}

				const data: FDAResponse = await response.json();

				// Add logging to see actual FDA response structure
				if (process.env.NODE_ENV === 'development' && data.results && data.results.length > 0) {
					const sample = data.results[0];
					console.log('Sample FDA search result structure:', {
						product_ndc: sample.product_ndc,
						ndc_package_code: sample.ndc_package_code,
						hasPackageDescription: !!sample.package_description,
						packageDescription: sample.package_description,
						allKeys: Object.keys(sample),
						fullSample: JSON.stringify(sample, null, 2)
					});
				}

				// Check for error in response
				if ('error' in data && data.error) {
					if (process.env.NODE_ENV === 'development') {
						console.log('FDA API error in response:', data.error);
					}
					continue;
				}

				if (!data.results || data.results.length === 0) {
					continue;
				}

				// Parse and filter results
				const ndcs: NDC[] = [];
				let missingPackageCount = 0;
				const MAX_PACKAGE_FETCHES = 10; // Limit to avoid too many API calls
				
				for (const result of data.results) {
					if (result.product_ndc) {
						let ndc = this.parseFDAResponse(result, result.product_ndc, drugName);
						
						// If package info is missing, try to fetch it separately
						// The FDA API search by product name returns product-level results without package_description
						// We need to search for packages by product_ndc to get package-level info
						if (ndc && !ndc.packageInfo && missingPackageCount < MAX_PACKAGE_FETCHES) {
							missingPackageCount++;
							try {
								// Try to get package info by searching for packages with this product_ndc
								const packageNDC = await this.getPackageInfoForProduct(result.product_ndc);
								if (packageNDC && packageNDC.packageInfo) {
									ndc.packageInfo = packageNDC.packageInfo;
									if (process.env.NODE_ENV === 'development') {
										console.log(`Successfully fetched package info for product ${result.product_ndc}:`, packageNDC.packageInfo);
									}
								} else if (process.env.NODE_ENV === 'development') {
									console.log(`No package info found for product ${result.product_ndc}`);
								}
							} catch (error) {
								// Silently fail - we'll just use what we have
								if (process.env.NODE_ENV === 'development') {
									console.log(`Could not fetch package details for product ${result.product_ndc}:`, error);
								}
							}
						}
						
						if (ndc) {
							ndc.rxcui = rxcui as typeof ndc.rxcui;
							ndcs.push(ndc);
						}
					}
				}

				if (ndcs.length > 0) {
					if (process.env.NODE_ENV === 'development') {
						console.log(`Found ${ndcs.length} NDCs using pattern: ${pattern}`);
					}
					return ndcs;
				}
			}

			// If all patterns failed, return empty array (not an error)
			if (process.env.NODE_ENV === 'development') {
				console.log(`No NDCs found for drug: ${drugName} (RxCUI: ${rxcui})`);
			}
			return [];
		} catch (error) {
			// Log but don't throw - return empty array instead
			logError(error, 'FDAService.getNDCsByRxCUI');
			if (process.env.NODE_ENV === 'development') {
				console.log('FDA search error (returning empty array):', error);
			}
			return [];
		}
	}

	/**
	 * Parses FDA API response to NDC object
	 * @param result - FDA API result object
	 * @param ndcCode - NDC code
	 * @param fallbackDrugName - Optional drug name to use as fallback if product name fields are missing
	 * @returns NDC object
	 */
	private parseFDAResponse(result: NonNullable<FDAResponse['results']>[0], ndcCode: string, fallbackDrugName?: string): NDC {
		const formattedNDC = formatNDC(ndcCode);
		
		// Try multiple fields for product name - check all possible fields
		let productName = 'Unknown Product';
		
		// Strategy 1: Try proprietary name with suffix
		if (result.proprietary_name) {
			if (result.proprietary_name_suffix) {
				productName = `${result.proprietary_name} ${result.proprietary_name_suffix}`.trim();
			} else {
				productName = result.proprietary_name;
			}
		}
		// Strategy 2: Try generic_name field (modern FDA API field)
		else if (result.generic_name) {
			productName = result.generic_name;
			// Add strength if available
			if (result.strength) {
				productName = `${productName} ${result.strength}`;
			}
		}
		// Strategy 3: Try non-proprietary name (generic name - legacy field)
		else if (result.non_proprietary_name) {
			productName = result.non_proprietary_name;
			// Add strength if available
			if (result.strength) {
				productName = `${productName} ${result.strength}`;
			}
		}
		// Strategy 4: Try brand_name field (alternative field name)
		else if (result.brand_name) {
			productName = result.brand_name;
		}
		// Strategy 4: Try product_type_name
		else if (result.product_type_name) {
			productName = result.product_type_name;
		}
		// Strategy 5: Use fallback drug name if provided
		else if (fallbackDrugName) {
			productName = fallbackDrugName;
			// Add strength if available to make it more specific
			if (result.strength) {
				productName = `${productName} ${result.strength}`;
			}
		}
		// Strategy 6: Construct from available fields
		else {
			// Try to build a name from dosage form and strength
			const parts: string[] = [];
			if (result.dosage_form) {
				parts.push(result.dosage_form);
			}
			if (result.strength) {
				parts.push(result.strength);
			}
			if (parts.length > 0) {
				productName = parts.join(' ');
			}
		}

		// Log in development to see what we're getting
		if (process.env.NODE_ENV === 'development' && productName === 'Unknown Product') {
			console.log('FDA result missing product name fields:', {
				proprietary_name: result.proprietary_name,
				non_proprietary_name: result.non_proprietary_name,
				brand_name: result.brand_name,
				product_type_name: result.product_type_name,
				proprietary_name_suffix: result.proprietary_name_suffix,
				dosage_form: result.dosage_form,
				strength: result.strength,
				ndc: ndcCode,
				allFields: Object.keys(result)
			});
		}

		// Determine status based on marketing dates
		let status = NDCStatus.ACTIVE;
		if (result.marketing_end_date) {
			const endDate = new Date(result.marketing_end_date);
			if (endDate < new Date()) {
				status = NDCStatus.INACTIVE;
			}
		}
		if (result.marketing_status === 'Discontinued') {
			status = NDCStatus.INACTIVE;
		}

		// Parse package information from package description
		// The FDA API has two structures:
		// 1. Legacy: package_description at top level
		// 2. Modern: packaging array with description field
		let packageInfo = this.parsePackageDescription(result.package_description);
		
		// If package_description parsing failed, try to extract from packaging array
		if (!packageInfo) {
			const packaging = result.packaging;
			if (packaging && Array.isArray(packaging) && packaging.length > 0) {
				// Try to parse from packaging array - use first package
				const firstPackage = packaging[0];
				if (firstPackage.description) {
					packageInfo = this.parsePackageDescription(firstPackage.description);
					if (process.env.NODE_ENV === 'development' && packageInfo) {
						console.log(`Parsed package info from packaging array:`, packageInfo);
					}
				}
			}
		}
		
		// Log if package info is still missing
		if (process.env.NODE_ENV === 'development' && !packageInfo) {
			console.log('FDA result missing package info - checking all fields:', {
				ndc: ndcCode,
				package_description: result.package_description,
				ndc_package_code: result.ndc_package_code,
				hasPackagingArray: !!(result as any).packaging,
				allKeys: Object.keys(result)
			});
		}

		return {
			ndc: formattedNDC,
			productName,
			manufacturer: result.labeler_name,
			dosageForm: result.dosage_form,
			strength: result.strength,
			packageInfo,
			status,
			lastUpdated: result.marketing_start_date
		};
	}

	/**
	 * Parses package description to extract package info
	 * @param description - Package description string
	 * @returns Package information
	 */
	private parsePackageDescription(description: string | undefined): PackageInfo | undefined {
		if (!description) {
			return undefined;
		}

		// Normalize the description - remove extra whitespace
		const normalized = description.trim().replace(/\s+/g, ' ');

		// Try multiple patterns for package description
		// Example formats:
		// "30 TABLET in 1 BOTTLE"
		// "100 TABLET in 1 BOTTLE (100 TABLET)"
		// "1 BOTTLE in 1 BOTTLE (30 TABLET)"
		// "30 TABLET, 1 in 1 BOTTLE"
		// "1 BOTTLE in 1 CARTON (30 TABLET in 1 BLISTER PACK)"
		// "30 TABLET in 1 BOTTLE, TYPE 0"
		// "30 TABLETS in 1 BOTTLE"
		
		// Pattern 1: "X UNIT in Y CONTAINER" - extract the quantity and unit
		// This matches the most common format: "30 TABLET in 1 BOTTLE"
		// Updated regex to handle plural forms (TABLETS, CAPSULES, etc.)
		const pattern1 = normalized.match(/(\d+)\s+(\w+)(?:S)?\s+in\s+\d+\s+(\w+)/i);
		if (pattern1) {
			const quantity = parseInt(pattern1[1], 10);
			// Normalize unit (remove plural 'S' if present)
			let unit = pattern1[2].toUpperCase();
			if (unit.endsWith('S') && unit.length > 1) {
				unit = unit.slice(0, -1); // Remove trailing 'S'
			}
			return {
				size: pattern1[1],
				unit: unit,
				type: pattern1[3].toUpperCase(),
				quantity: quantity
			};
		}
		
		// Pattern 2: "X UNIT, Y in Z CONTAINER" - e.g., "30 TABLET, 1 in 1 BOTTLE"
		const pattern2 = normalized.match(/(\d+)\s+(\w+)(?:S)?,\s+\d+\s+in\s+\d+\s+(\w+)/i);
		if (pattern2) {
			const quantity = parseInt(pattern2[1], 10);
			let unit = pattern2[2].toUpperCase();
			if (unit.endsWith('S') && unit.length > 1) {
				unit = unit.slice(0, -1);
			}
			return {
				size: pattern2[1],
				unit: unit,
				type: pattern2[3].toUpperCase(),
				quantity: quantity
			};
		}
		
		// Pattern 3: Parentheses pattern - e.g., "1 BOTTLE in 1 BOTTLE (30 TABLET)"
		const parenPattern = normalized.match(/\((\d+)\s+(\w+)(?:S)?\)/i);
		if (parenPattern) {
			const quantity = parseInt(parenPattern[1], 10);
			let unit = parenPattern[2].toUpperCase();
			if (unit.endsWith('S') && unit.length > 1) {
				unit = unit.slice(0, -1);
			}
			const containerType = normalized.match(/(\d+)\s+(\w+)\s+in\s+\d+\s+(\w+)/i);
			return {
				size: parenPattern[1],
				unit: unit,
				type: containerType ? containerType[3].toUpperCase() : 'BOTTLE',
				quantity: quantity
			};
		}
		
		// Pattern 4: Just "X UNIT" at the start (handle plurals)
		const pattern4 = normalized.match(/^(\d+)\s+(\w+)(?:S)?/i);
		if (pattern4) {
			const quantity = parseInt(pattern4[1], 10);
			let unit = pattern4[2].toUpperCase();
			if (unit.endsWith('S') && unit.length > 1) {
				unit = unit.slice(0, -1);
			}
			let containerType = 'PACK';
			if (normalized.includes('BOTTLE')) containerType = 'BOTTLE';
			else if (normalized.includes('VIAL')) containerType = 'VIAL';
			else if (normalized.includes('CARTON')) containerType = 'CARTON';
			else if (normalized.includes('BLISTER')) containerType = 'BLISTER PACK';
			else if (normalized.includes('PACK')) containerType = 'PACK';
			
			return {
				size: pattern4[1],
				unit: unit,
				type: containerType,
				quantity: quantity
			};
		}

		// Pattern 5: Any "X UNIT" pattern (fallback, handle plurals)
		const pattern5 = normalized.match(/(\d+)\s+(\w+)(?:S)?/i);
		if (pattern5) {
			const quantity = parseInt(pattern5[1], 10);
			let unit = pattern5[2].toUpperCase();
			if (unit.endsWith('S') && unit.length > 1) {
				unit = unit.slice(0, -1);
			}
			let containerType = 'PACK';
			if (normalized.includes('BOTTLE')) containerType = 'BOTTLE';
			else if (normalized.includes('VIAL')) containerType = 'VIAL';
			else if (normalized.includes('CARTON')) containerType = 'CARTON';
			else if (normalized.includes('BLISTER')) containerType = 'BLISTER PACK';
			
			return {
				size: pattern5[1],
				unit: unit,
				type: containerType,
				quantity: quantity
			};
		}

		// If no pattern matches, log and return undefined (don't return invalid data)
		if (process.env.NODE_ENV === 'development') {
			console.log('Could not parse package description:', description);
		}
		return undefined;
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
			const headers: HeadersInit = {
				'Content-Type': 'application/json'
			};

			if (this.config.apiKey) {
				headers['Authorization'] = `Bearer ${this.config.apiKey}`;
			}

			const response = await fetch(url, {
				signal: controller.signal,
				headers
			});

			clearTimeout(timeoutId);

			// Handle rate limiting
			if (response.status === 429) {
				if (retries < this.config.maxRetries) {
					// Wait before retrying (exponential backoff)
					await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retries) * 1000));
					return this.fetchWithTimeout(url, retries + 1);
				}
			}

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
}

/**
 * Default FDA service instance
 */
export const fdaService = new FDAService({
	baseUrl: process.env.FDA_API_URL || DEFAULT_CONFIG.baseUrl,
	apiKey: process.env.FDA_API_KEY || DEFAULT_CONFIG.apiKey,
	timeout: DEFAULT_CONFIG.timeout,
	maxRetries: DEFAULT_CONFIG.maxRetries
});

