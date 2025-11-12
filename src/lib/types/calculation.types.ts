/**
 * Calculation-related type definitions for quantity calculation and package selection
 */

import type { NDC, PackageInfo } from './ndc.types.js';
import type { RxCUI } from './drug.types.js';

/**
 * Parsed SIG (dosing instructions) components
 */
export interface ParsedSIG {
	/** Dose amount (e.g., 1, 2, 10) */
	dose: number;
	/** Unit of measurement (e.g., "tablet", "ml", "mg") */
	unit: string;
	/** Frequency per day */
	frequency: number;
	/** Additional instructions */
	instructions?: string;
}

/**
 * Input for quantity calculation
 */
export interface CalculationInput {
	/** Drug name or NDC */
	drugName?: string;
	ndc?: string;
	/** RxCUI (if already normalized) */
	rxcui?: RxCUI;
	/** SIG (dosing instructions) */
	sig: string;
	/** Days' supply */
	daysSupply: number;
}

/**
 * Warning types for quantity calculations
 */
export enum WarningType {
	/** Overfill detected (dispensing more than needed) */
	OVERFILL = 'OVERFILL',
	/** Underfill detected (dispensing less than needed) */
	UNDERFILL = 'UNDERFILL',
	/** Inactive NDC detected */
	INACTIVE_NDC = 'INACTIVE_NDC',
	/** Package size mismatch */
	PACKAGE_MISMATCH = 'PACKAGE_MISMATCH',
	/** Unusual quantity detected */
	UNUSUAL_QUANTITY = 'UNUSUAL_QUANTITY'
}

/**
 * Warning message structure
 */
export interface Warning {
	/** Warning type */
	type: WarningType;
	/** Warning message */
	message: string;
	/** Severity level */
	severity: 'low' | 'medium' | 'high';
	/** Additional details */
	details?: unknown;
}

/**
 * Package recommendation for dispensing
 */
export interface DispenseRecommendation {
	/** Recommended NDC */
	ndc: NDC;
	/** Number of packages to dispense */
	packageCount: number;
	/** Total quantity from this package */
	totalQuantity: number;
	/** Unit of measurement */
	unit: string;
	/** Whether this is an exact match */
	exactMatch: boolean;
	/** Overfill amount (if any) */
	overfill?: number;
	/** Underfill amount (if any) */
	underfill?: number;
	/** Overfill/underfill percentage */
	variancePercentage?: number;
}

/**
 * Complete calculation result
 */
export interface CalculationResult {
	/** Input drug information */
	drugName: string;
	/** RxCUI code */
	rxcui: RxCUI;
	/** Parsed SIG */
	parsedSIG: ParsedSIG;
	/** Calculated total quantity needed */
	totalQuantity: number;
	/** Unit of measurement */
	unit: string;
	/** Days' supply */
	daysSupply: number;
	/** Recommended NDC packages */
	recommendations: DispenseRecommendation[];
	/** Available NDCs (all options) */
	availableNDCs: NDC[];
	/** Warnings and alerts */
	warnings: Warning[];
	/** Whether calculation was successful */
	success: boolean;
	/** Error message (if unsuccessful) */
	error?: string;
}

/**
 * Special dosage form types
 */
export enum DosageForm {
	/** Liquid medications */
	LIQUID = 'LIQUID',
	/** Inhalers */
	INHALER = 'INHALER',
	/** Insulin */
	INSULIN = 'INSULIN',
	/** Tablets */
	TABLET = 'TABLET',
	/** Capsules */
	CAPSULE = 'CAPSULE',
	/** Other */
	OTHER = 'OTHER'
}

