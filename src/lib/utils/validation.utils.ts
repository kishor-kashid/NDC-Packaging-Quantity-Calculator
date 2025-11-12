/**
 * Validation utility functions for input validation
 */

import type { ValidationError } from '../types/index.js';

/**
 * Validates a drug name input
 * @param drugName - Drug name to validate
 * @returns Validation error if invalid, null if valid
 */
export function validateDrugName(drugName: string | undefined): ValidationError | null {
	if (!drugName || drugName.trim().length === 0) {
		return {
			field: 'drugName',
			message: 'Drug name is required',
			value: drugName
		};
	}

	if (drugName.trim().length < 2) {
		return {
			field: 'drugName',
			message: 'Drug name must be at least 2 characters',
			value: drugName
		};
	}

	if (drugName.length > 200) {
		return {
			field: 'drugName',
			message: 'Drug name must be less than 200 characters',
			value: drugName
		};
	}

	return null;
}

/**
 * Validates an NDC code
 * NDC format: 11 digits (can be formatted with dashes)
 * @param ndc - NDC code to validate
 * @returns Validation error if invalid, null if valid
 */
export function validateNDC(ndc: string | undefined): ValidationError | null {
	if (!ndc || ndc.trim().length === 0) {
		return {
			field: 'ndc',
			message: 'NDC code is required',
			value: ndc
		};
	}

	// Remove dashes and spaces for validation
	const cleanNDC = ndc.replace(/[-\s]/g, '');

	// NDC should be 8, 9, 10, or 11 digits
	// Some NDCs are 8 digits (4-4 format, product NDC), 9 digits (4-4-1), 10 digits (5-4-1 or 4-4-2), or 11 digits (5-4-2)
	if (!/^\d{8,11}$/.test(cleanNDC)) {
		return {
			field: 'ndc',
			message: 'NDC must be 8, 9, 10, or 11 digits (dashes optional)',
			value: ndc
		};
	}

	return null;
}

/**
 * Validates SIG (dosing instructions)
 * @param sig - SIG string to validate
 * @returns Validation error if invalid, null if valid
 */
export function validateSIG(sig: string | undefined): ValidationError | null {
	if (!sig || sig.trim().length === 0) {
		return {
			field: 'sig',
			message: 'SIG (dosing instructions) is required',
			value: sig
		};
	}

	if (sig.trim().length < 3) {
		return {
			field: 'sig',
			message: 'SIG must be at least 3 characters',
			value: sig
		};
	}

	if (sig.length > 500) {
		return {
			field: 'sig',
			message: 'SIG must be less than 500 characters',
			value: sig
		};
	}

	return null;
}

/**
 * Validates days' supply
 * @param daysSupply - Days' supply to validate
 * @returns Validation error if invalid, null if valid
 */
export function validateDaysSupply(daysSupply: number | undefined): ValidationError | null {
	if (daysSupply === undefined || daysSupply === null) {
		return {
			field: 'daysSupply',
			message: 'Days supply is required',
			value: daysSupply
		};
	}

	if (typeof daysSupply !== 'number' || isNaN(daysSupply)) {
		return {
			field: 'daysSupply',
			message: 'Days supply must be a number',
			value: daysSupply
		};
	}

	if (daysSupply <= 0) {
		return {
			field: 'daysSupply',
			message: 'Days supply must be greater than 0',
			value: daysSupply
		};
	}

	if (daysSupply > 365) {
		return {
			field: 'daysSupply',
			message: 'Days supply must be 365 or less',
			value: daysSupply
		};
	}

	if (!Number.isInteger(daysSupply)) {
		return {
			field: 'daysSupply',
			message: 'Days supply must be a whole number',
			value: daysSupply
		};
	}

	return null;
}

/**
 * Validates RxCUI code
 * @param rxcui - RxCUI code to validate
 * @returns Validation error if invalid, null if valid
 */
export function validateRxCUI(rxcui: string | undefined): ValidationError | null {
	if (!rxcui || rxcui.trim().length === 0) {
		return {
			field: 'rxcui',
			message: 'RxCUI is required',
			value: rxcui
		};
	}

	// RxCUI should be numeric
	if (!/^\d+$/.test(rxcui.trim())) {
		return {
			field: 'rxcui',
			message: 'RxCUI must be a numeric code',
			value: rxcui
		};
	}

	return null;
}

/**
 * Validates calculation input
 * @param input - Calculation input object
 * @returns Array of validation errors (empty if valid)
 */
export function validateCalculationInput(input: {
	drugName?: string;
	ndc?: string;
	sig?: string;
	daysSupply?: number;
}): ValidationError[] {
	const errors: ValidationError[] = [];

	// Must have either drugName or ndc
	if (!input.drugName && !input.ndc) {
		errors.push({
			field: 'drugName',
			message: 'Either drug name or NDC is required',
			value: input
		});
	}

	// Validate drug name if provided
	if (input.drugName) {
		const drugError = validateDrugName(input.drugName);
		if (drugError) errors.push(drugError);
	}

	// Validate NDC if provided
	if (input.ndc) {
		const ndcError = validateNDC(input.ndc);
		if (ndcError) errors.push(ndcError);
	}

	// Validate SIG
	const sigError = validateSIG(input.sig);
	if (sigError) errors.push(sigError);

	// Validate days supply
	const daysError = validateDaysSupply(input.daysSupply);
	if (daysError) errors.push(daysError);

	return errors;
}

