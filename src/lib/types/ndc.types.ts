/**
 * NDC-related type definitions for FDA NDC Directory API integration
 */

import type { RxCUI } from './drug.types.js';

/**
 * NDC status enumeration
 */
export enum NDCStatus {
	/** NDC is currently active */
	ACTIVE = 'ACTIVE',
	/** NDC is inactive/discontinued */
	INACTIVE = 'INACTIVE',
	/** Status is unknown */
	UNKNOWN = 'UNKNOWN'
}

/**
 * Package size information
 */
export interface PackageInfo {
	/** Package size (e.g., "30", "90", "100ml") */
	size: string;
	/** Unit of measurement */
	unit: string;
	/** Package type (e.g., "BOTTLE", "VIAL", "PACK") */
	type?: string;
	/** Quantity in package */
	quantity?: number;
}

/**
 * NDC information structure
 */
export interface NDC {
	/** NDC code (11-digit format) */
	ndc: string;
	/** Product name */
	productName: string;
	/** Manufacturer name */
	manufacturer?: string;
	/** Dosage form (e.g., "TABLET", "CAPSULE", "LIQUID") */
	dosageForm?: string;
	/** Strength (e.g., "10mg", "5mg/5ml") */
	strength?: string;
	/** Package information */
	packageInfo?: PackageInfo;
	/** Active/Inactive status */
	status: NDCStatus;
	/** RxCUI associated with this NDC */
	rxcui?: RxCUI;
	/** Last updated date */
	lastUpdated?: string;
}

/**
 * FDA NDC Directory API response structure
 */
export interface FDAResponse {
	/** Total number of results */
	results?: Array<{
		/** Product NDC */
		product_ndc?: string;
		/** Product type name */
		product_type_name?: string;
		/** Proprietary name */
		proprietary_name?: string;
		/** Proprietary name suffix */
		proprietary_name_suffix?: string;
		/** Non-proprietary name */
		non_proprietary_name?: string;
		/** Generic name */
		generic_name?: string;
		/** Dosage form */
		dosage_form?: string;
		/** Route of administration */
		route?: string[];
		/** Active ingredient(s) */
		active_ingredient_unit?: string;
		/** Strength */
		strength?: string;
		/** Marketing status */
		marketing_status?: string;
		/** Marketing start date */
		marketing_start_date?: string;
		/** Marketing end date */
		marketing_end_date?: string;
		/** Package description (legacy field) */
		package_description?: string;
		/** NDC package code (legacy field) */
		ndc_package_code?: string;
		/** Sample package */
		sample_package?: string;
		/** Labeler name */
		labeler_name?: string;
		/** Brand name (alternative field) */
		brand_name?: string;
		/** Packaging array - contains package-level information */
		packaging?: Array<{
			/** Package NDC */
			package_ndc?: string;
			/** Package description */
			description?: string;
			/** Marketing start date */
			marketing_start_date?: string;
			/** Sample package flag */
			sample?: boolean;
		}>;
	}>;
	/** Pagination information */
	meta?: {
		skip?: number;
		limit?: number;
		total?: number;
	};
}

/**
 * NDC response from our API
 */
export interface NDCResponse {
	/** List of NDCs */
	ndcs: NDC[];
	/** Total count */
	total: number;
	/** Filtered count (active only) */
	activeCount: number;
}

