/**
 * Sample data for testing and development
 */

import type {
	DrugInput,
	CalculationInput,
	CalculationResult,
	NDC,
	ParsedSIG,
	DispenseRecommendation,
	Warning
} from '../types/index.js';
import { NDCStatus, WarningType } from '../types/index.js';

/**
 * Sample drug names (brand and generic)
 */
export const sampleDrugNames = {
	brand: [
		'Lisinopril',
		'Metformin',
		'Atorvastatin',
		'Amlodipine',
		'Omeprazole',
		'Metoprolol',
		'Losartan',
		'Albuterol',
		'Gabapentin',
		'Tramadol'
	],
	generic: [
		'Lisinopril 10mg',
		'Metformin HCl 500mg',
		'Atorvastatin Calcium 20mg',
		'Amlodipine Besylate 5mg',
		'Omeprazole 20mg',
		'Metoprolol Tartrate 25mg',
		'Losartan Potassium 50mg',
		'Albuterol Sulfate',
		'Gabapentin 300mg',
		'Tramadol HCl 50mg'
	]
};

/**
 * Sample NDC codes (11-digit format)
 */
export const sampleNDCs = [
	'68180-0101-01', // Example NDC format
	'00069-1234-56',
	'12345-6789-01',
	'54321-9876-54',
	'11111-2222-33'
];

/**
 * Sample SIG (dosing instructions)
 */
export const sampleSIGs = [
	'Take 1 tablet by mouth twice daily',
	'Take 2 capsules every 8 hours',
	'Take 10ml by mouth once daily',
	'1 tablet every 12 hours',
	'Take 1 tablet in the morning and 1 tablet at bedtime',
	'Take 2 tablets with food three times daily',
	'Take 1 capsule by mouth once daily',
	'Take 1-2 tablets every 4-6 hours as needed for pain',
	'Take 1 tablet in the morning',
	'Take 1 tablet by mouth twice daily with meals'
];

/**
 * Sample days' supply values
 */
export const sampleDaysSupply = [30, 60, 90, 7, 14, 28, 45, 100, 180, 365];

/**
 * Sample calculation inputs
 */
export const sampleCalculationInputs: CalculationInput[] = [
	{
		drugName: 'Lisinopril',
		sig: 'Take 1 tablet by mouth twice daily',
		daysSupply: 30
	},
	{
		drugName: 'Metformin',
		sig: 'Take 2 tablets with food twice daily',
		daysSupply: 90
	},
	{
		ndc: '68180-0101-01',
		sig: 'Take 1 capsule once daily',
		daysSupply: 30
	},
	{
		drugName: 'Atorvastatin',
		sig: 'Take 1 tablet by mouth once daily at bedtime',
		daysSupply: 90
	}
];

/**
 * Sample NDC objects
 */
export const sampleNDCsData: NDC[] = [
	{
		ndc: '68180-0101-01',
		productName: 'Lisinopril 10mg Tablet',
		manufacturer: 'Example Pharmaceuticals',
		dosageForm: 'TABLET',
		strength: '10mg',
		packageInfo: {
			size: '30',
			unit: 'tablet',
			type: 'BOTTLE',
			quantity: 30
		},
		status: NDCStatus.ACTIVE,
		lastUpdated: '2024-01-15'
	},
	{
		ndc: '68180-0101-02',
		productName: 'Lisinopril 10mg Tablet',
		manufacturer: 'Example Pharmaceuticals',
		dosageForm: 'TABLET',
		strength: '10mg',
		packageInfo: {
			size: '90',
			unit: 'tablet',
			type: 'BOTTLE',
			quantity: 90
		},
		status: NDCStatus.ACTIVE,
		lastUpdated: '2024-01-15'
	},
	{
		ndc: '00069-1234-56',
		productName: 'Metformin HCl 500mg Tablet',
		manufacturer: 'Generic Pharma Inc',
		dosageForm: 'TABLET',
		strength: '500mg',
		packageInfo: {
			size: '60',
			unit: 'tablet',
			type: 'BOTTLE',
			quantity: 60
		},
		status: NDCStatus.ACTIVE,
		lastUpdated: '2024-02-01'
	},
	{
		ndc: '12345-6789-01',
		productName: 'Atorvastatin 20mg Tablet',
		manufacturer: 'Pharma Corp',
		dosageForm: 'TABLET',
		strength: '20mg',
		packageInfo: {
			size: '30',
			unit: 'tablet',
			type: 'BOTTLE',
			quantity: 30
		},
		status: NDCStatus.INACTIVE,
		lastUpdated: '2023-12-01'
	}
];

/**
 * Sample parsed SIG
 */
export const sampleParsedSIG: ParsedSIG = {
	dose: 1,
	unit: 'tablet',
	frequency: 2,
	instructions: 'Take 1 tablet by mouth twice daily'
};

/**
 * Sample dispense recommendations
 */
export const sampleRecommendations: DispenseRecommendation[] = [
	{
		ndc: sampleNDCsData[0],
		packageCount: 1,
		totalQuantity: 30,
		unit: 'tablet',
		exactMatch: true,
		variancePercentage: 0
	},
	{
		ndc: sampleNDCsData[1],
		packageCount: 1,
		totalQuantity: 90,
		unit: 'tablet',
		exactMatch: false,
		overfill: 30,
		variancePercentage: 33.3
	}
];

/**
 * Sample warnings
 */
export const sampleWarnings: Warning[] = [
	{
		type: WarningType.OVERFILL,
		message: 'Overfill detected: 30 tablet (33.3% more than needed)',
		severity: 'medium',
		details: {
			overfillAmount: 30,
			overfillPercent: 33.3
		}
	},
	{
		type: WarningType.INACTIVE_NDC,
		message: '1 inactive NDC(s) found in results',
		severity: 'high',
		details: {
			inactiveNDCs: ['12345-6789-01']
		}
	}
];

/**
 * Sample complete calculation result
 */
export const sampleCalculationResult: CalculationResult = {
	drugName: 'Lisinopril',
	rxcui: '29046' as any,
	parsedSIG: sampleParsedSIG,
	totalQuantity: 60,
	unit: 'tablet',
	daysSupply: 30,
	recommendations: sampleRecommendations,
	availableNDCs: sampleNDCsData,
	warnings: sampleWarnings,
	success: true
};

/**
 * Sample API responses
 */
export const sampleAPIResponses = {
	normalize: {
		success: true,
		data: {
			rxcui: '29046',
			drugName: 'Lisinopril',
			normalized: true
		}
	},
	ndc: {
		success: true,
		data: {
			ndcs: sampleNDCsData,
			total: 4,
			activeCount: 3
		}
	},
	calculate: {
		success: true,
		data: sampleCalculationResult
	},
	error: {
		success: false,
		error: {
			message: 'Drug not found',
			code: 'NOT_FOUND'
		}
	}
};

/**
 * Test scenarios for different use cases
 */
export const testScenarios = {
	exactMatch: {
		drugName: 'Lisinopril',
		sig: 'Take 1 tablet twice daily',
		daysSupply: 30,
		expectedQuantity: 60
	},
	overfill: {
		drugName: 'Metformin',
		sig: 'Take 2 tablets twice daily',
		daysSupply: 30,
		expectedQuantity: 120
	},
	liquid: {
		drugName: 'Amoxicillin',
		sig: 'Take 5ml three times daily',
		daysSupply: 10,
		expectedQuantity: 150
	},
	inhaler: {
		drugName: 'Albuterol',
		sig: 'Take 2 puffs every 4 hours as needed',
		daysSupply: 30,
		expectedQuantity: 360
	},
	largeQuantity: {
		drugName: 'Gabapentin',
		sig: 'Take 1 capsule three times daily',
		daysSupply: 90,
		expectedQuantity: 270
	}
};

/**
 * Mock RxNorm API response
 */
export const mockRxNormResponse = {
	drugGroup: {
		conceptGroup: [
			{
				tty: 'BN',
				conceptProperties: [
					{
						rxcui: '29046',
						name: 'Lisinopril',
						synonym: 'Lisinopril 10 MG Oral Tablet',
						tty: 'BN',
						language: 'ENG'
					}
				]
			}
		]
	}
};

/**
 * Mock FDA API response
 */
export const mockFDAResponse = {
	results: [
		{
			product_ndc: '68180-0101',
			proprietary_name: 'Lisinopril',
			non_proprietary_name: 'Lisinopril',
			dosage_form: 'TABLET',
			strength: '10mg',
			marketing_status: 'Active',
			marketing_start_date: '2024-01-15',
			package_description: '30 TABLET in 1 BOTTLE',
			ndc_package_code: '68180-0101-01',
			labeler_name: 'Example Pharmaceuticals'
		}
	],
	meta: {
		skip: 0,
		limit: 1,
		total: 1
	}
};

