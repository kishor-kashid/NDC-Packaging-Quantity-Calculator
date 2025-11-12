/**
 * Drug-related type definitions for RxNorm API integration
 */

/**
 * Branded type for RxCUI (RxNorm Concept Unique Identifier)
 */
export type RxCUI = string & { readonly __brand: 'RxCUI' };

/**
 * Input for drug name or NDC lookup
 */
export interface DrugInput {
	/** Drug name (brand or generic) */
	drugName?: string;
	/** NDC code (11-digit format) */
	ndc?: string;
}

/**
 * RxNorm API response for drug name normalization
 */
export interface RxNormResponse {
	/** RxCUI code for the drug */
	rxcui: RxCUI;
	/** Normalized drug name */
	name: string;
	/** Alternative names/variations */
	alternateNames?: string[];
	/** TTY (Term Type) - e.g., 'BN' (Brand Name), 'IN' (Ingredient) */
	tty?: string;
}

/**
 * Response from RxNorm API when searching for drugs
 */
export interface RxNormSearchResponse {
	/** List of matching drugs */
	drugGroup?: {
		conceptGroup?: Array<{
			tty?: string;
			conceptProperties?: Array<{
				rxcui?: string;
				name?: string;
				synonym?: string;
				tty?: string;
				language?: string;
			}>;
		}>;
	};
	/** Approximate term response */
	approximateGroup?: {
		candidate?: Array<{
			rxcui?: string;
			name?: string;
			score?: string;
		}>;
	};
}

/**
 * Response from RxNorm API for getting NDCs by RxCUI
 */
export interface RxNormNDCResponse {
	/** RxCUI code */
	rxcui: RxCUI;
	/** List of associated NDC codes */
	ndcList?: {
		ndc?: string[];
	};
}

/**
 * Generic API response wrapper
 */
export interface APIResponse<T> {
	/** Whether the request was successful */
	success: boolean;
	/** Response data (if successful) */
	data?: T;
	/** Error information (if unsuccessful) */
	error?: ErrorResponse;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
	/** Error message */
	message: string;
	/** Error code (optional) */
	code?: string;
	/** Additional error details */
	details?: unknown;
}

/**
 * Validation error structure
 */
export interface ValidationError {
	/** Field that failed validation */
	field: string;
	/** Error message */
	message: string;
	/** Invalid value */
	value?: unknown;
}

