/**
 * Drug Interaction Service
 * Handles drug-drug interactions, allergy checking, and contraindication warnings
 * 
 * Note: This is a placeholder service. In production, this would integrate with:
 * - RxNorm API (for interactions)
 * - DrugBank API
 * - Micromedex API
 * - First Databank (FDB) API
 */

import type { DrugInteraction, AllergyInfo, ContraindicationInfo } from '../types/filtering.types.js';
import type { NDC } from '../types/ndc.types.js';
import { logError } from '../utils/index.js';

/**
 * Drug Interaction Service class
 */
export class DrugInteractionService {
	/**
	 * Checks for drug-drug interactions
	 * @param currentDrug - Current drug NDC
	 * @param otherDrugs - List of other drugs patient is taking
	 * @returns List of drug interactions
	 */
	async checkInteractions(currentDrug: NDC, otherDrugs: NDC[]): Promise<DrugInteraction[]> {
		// TODO: Integrate with real drug interaction API
		// For now, return empty array (no interactions found)
		
		try {
			// Mock implementation - in production, this would call:
			// - RxNorm API: https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=...
			// - DrugBank API
			// - Micromedex API
			
			// Simulate API call delay
			await new Promise(resolve => setTimeout(resolve, 100));

			// In production, this would be an actual API call
			// Example RxNorm interaction check:
			// const url = `https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui=${rxcui1}&rxcui=${rxcui2}`;
			
			return [];
		} catch (error) {
			logError(error, 'DrugInteractionService.checkInteractions');
			return [];
		}
	}

	/**
	 * Checks for allergies
	 * @param ndc - Drug NDC to check
	 * @param knownAllergies - List of known allergies (substance names)
	 * @returns Allergy information
	 */
	checkAllergies(ndc: NDC, knownAllergies: string[]): AllergyInfo {
		if (!knownAllergies || knownAllergies.length === 0) {
			return {
				hasAllergy: false,
				allergens: []
			};
		}

		const allergens: string[] = [];
		const productName = ndc.productName.toLowerCase();
		const activeIngredients = ndc.strength || '';

		// Check if any known allergy matches drug name or ingredients
		for (const allergy of knownAllergies) {
			const allergyLower = allergy.toLowerCase();
			
			// Check product name
			if (productName.includes(allergyLower) || allergyLower.includes(productName)) {
				allergens.push(allergy);
				continue;
			}

			// Check active ingredients (if available)
			if (activeIngredients.toLowerCase().includes(allergyLower)) {
				allergens.push(allergy);
			}
		}

		return {
			hasAllergy: allergens.length > 0,
			allergens,
			severity: allergens.length > 0 ? 'moderate' : undefined
		};
	}

	/**
	 * Checks for contraindications
	 * @param ndc - Drug NDC to check
	 * @param conditions - List of patient conditions
	 * @returns Contraindication information
	 */
	checkContraindications(ndc: NDC, conditions: string[]): ContraindicationInfo {
		// TODO: Integrate with real contraindication API
		// For now, return basic check based on common patterns
		
		const contraindications: string[] = [];

		// Basic pattern matching (in production, use real API)
		const productName = ndc.productName.toLowerCase();

		// Example: ACE inhibitors contraindicated in pregnancy
		if (productName.includes('lisinopril') || productName.includes('enalapril')) {
			if (conditions.some(c => c.toLowerCase().includes('pregnancy'))) {
				contraindications.push('ACE inhibitors are contraindicated in pregnancy');
			}
		}

		// Example: Statins contraindicated in active liver disease
		if (productName.includes('statin')) {
			if (conditions.some(c => c.toLowerCase().includes('liver'))) {
				contraindications.push('Statins may be contraindicated in active liver disease');
			}
		}

		return {
			hasContraindication: contraindications.length > 0,
			contraindications,
			reason: contraindications.length > 0 ? conditions.join(', ') : undefined
		};
	}

	/**
	 * Gets interaction severity level
	 * @param interaction - Drug interaction
	 * @returns Severity level for warning
	 */
	getInteractionSeverity(interaction: DrugInteraction): 'low' | 'medium' | 'high' {
		switch (interaction.severity) {
			case 'contraindicated':
				return 'high';
			case 'major':
				return 'high';
			case 'moderate':
				return 'medium';
			case 'minor':
				return 'low';
			default:
				return 'low';
		}
	}
}

/**
 * Default drug interaction service instance
 */
export const drugInteractionService = new DrugInteractionService();

