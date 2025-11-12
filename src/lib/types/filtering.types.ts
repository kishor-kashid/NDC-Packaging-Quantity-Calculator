/**
 * Filtering and matching type definitions
 */

import type { NDC } from './ndc.types.js';

/**
 * Dosage form filter options
 */
export type DosageFormFilter = 
	| 'TABLET'
	| 'CAPSULE'
	| 'LIQUID'
	| 'INJECTION'
	| 'INHALER'
	| 'TOPICAL'
	| 'SUPPOSITORY'
	| 'ALL'
	| null;

/**
 * Strength matching information
 */
export interface StrengthMatch {
	/** Extracted strength from drug name or NDC (e.g., "20mg", "5mg/5ml") */
	strength: string | null;
	/** Whether strength matches between input and NDC */
	matches: boolean;
	/** Extracted numeric value (e.g., 20 from "20mg") */
	numericValue?: number;
	/** Unit (e.g., "mg", "ml") */
	unit?: string;
}

/**
 * Dosage form matching information
 */
export interface DosageFormMatch {
	/** Extracted dosage form from SIG or preference */
	preferredForm: DosageFormFilter | null;
	/** Whether NDC dosage form matches preferred form */
	matches: boolean;
	/** Warning level if mismatch */
	warningLevel?: 'none' | 'low' | 'medium' | 'high';
}

/**
 * Insurance formulary information
 */
export interface FormularyInfo {
	/** Whether NDC is covered by insurance */
	covered: boolean;
	/** Tier level (1-5, lower is better) */
	tier?: number;
	/** Whether prior authorization is required */
	priorAuthRequired: boolean;
	/** Preferred alternative NDC (if not covered) */
	preferredAlternative?: NDC;
	/** Insurance plan name */
	planName?: string;
}

/**
 * Drug interaction information
 */
export interface DrugInteraction {
	/** Severity level */
	severity: 'contraindicated' | 'major' | 'moderate' | 'minor' | 'unknown';
	/** Interaction description */
	description: string;
	/** Interacting drug names */
	interactingDrugs: string[];
	/** Clinical significance */
	clinicalSignificance?: string;
	/** Management recommendations */
	management?: string;
}

/**
 * Allergy information
 */
export interface AllergyInfo {
	/** Whether drug matches known allergies */
	hasAllergy: boolean;
	/** Allergic substances found */
	allergens: string[];
	/** Severity of allergy */
	severity?: 'mild' | 'moderate' | 'severe' | 'life-threatening';
}

/**
 * Contraindication information
 */
export interface ContraindicationInfo {
	/** Whether contraindications exist */
	hasContraindication: boolean;
	/** Contraindication descriptions */
	contraindications: string[];
	/** Condition or medication causing contraindication */
	reason?: string;
}

/**
 * Drug search suggestion
 */
export interface DrugSuggestion {
	/** Drug name */
	name: string;
	/** RxCUI (if available) */
	rxcui?: string;
	/** Common strength (if available) */
	strength?: string;
	/** Common dosage form (if available) */
	dosageForm?: string;
	/** Whether it's a brand name */
	isBrand?: boolean;
}

