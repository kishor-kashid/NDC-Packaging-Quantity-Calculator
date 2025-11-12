/**
 * Enhanced SIG Parser Service
 * Handles complex SIG patterns including ranges, multiple times, tapering schedules, and AI-assisted parsing
 */

import type { ParsedSIG, DosingScheduleEntry } from '../types/calculation.types.js';
import { logError } from '../utils/index.js';

/**
 * SIG Parser Service class
 */
export class SIGParserService {
	private openAIApiKey: string | null = null;
	private useAI: boolean = false;

	constructor() {
		// Check for OpenAI API key in environment
		if (typeof process !== 'undefined' && process.env) {
			this.openAIApiKey = process.env.OPENAI_API_KEY || null;
			this.useAI = !!this.openAIApiKey;
		}
	}

	/**
	 * Parses SIG with support for complex patterns
	 * @param sig - SIG string
	 * @param useAI - Whether to use AI-assisted parsing (default: auto-detect)
	 * @returns Parsed SIG object
	 */
	async parseSIG(sig: string, useAI?: boolean): Promise<ParsedSIG> {
		const shouldUseAI = useAI ?? this.useAI;

		// Try AI parsing first if enabled
		if (shouldUseAI && this.openAIApiKey) {
			try {
				const aiParsed = await this.parseWithAI(sig);
				if (aiParsed) {
					return aiParsed;
				}
			} catch (error) {
				logError(error, 'SIGParserService.parseSIG (AI)');
				// Fall through to rule-based parsing
			}
		}

		// Use enhanced rule-based parsing
		return this.parseWithRules(sig);
	}

	/**
	 * Parses SIG using OpenAI API
	 * @param sig - SIG string
	 * @returns Parsed SIG object or null if parsing fails
	 */
	private async parseWithAI(sig: string): Promise<ParsedSIG | null> {
		if (!this.openAIApiKey) {
			return null;
		}

		try {
			const response = await fetch('https://api.openai.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.openAIApiKey}`
				},
				body: JSON.stringify({
					model: 'gpt-4o-mini', // Use cost-effective model
					messages: [
						{
							role: 'system',
							content: `You are a medical prescription parser. Parse the given SIG (dosing instructions) into structured JSON format.

Return a JSON object with this structure:
{
  "dose": number (primary dose, or average if complex),
  "unit": string (e.g., "tablet", "ml", "mg"),
  "frequency": number (times per day, or average if complex),
  "isComplex": boolean,
  "schedule": [{
    "dose": number,
    "maxDose": number (optional, for ranges),
    "frequency": number,
    "timeOfDay": string (optional, e.g., "morning", "bedtime"),
    "dayRange": string (optional, e.g., "day 1", "days 1-3"),
    "prn": boolean (optional)
  }],
  "prn": boolean,
  "averageDailyDose": number (if complex),
  "instructions": string (original SIG)
}

Examples:
- "Take 1 tablet twice daily" → {"dose": 1, "unit": "tablet", "frequency": 2, "isComplex": false}
- "Take 1-2 tablets as needed" → {"dose": 1, "maxDose": 2, "unit": "tablet", "frequency": 0, "prn": true, "isComplex": false, "averageDailyDose": 1.5}
- "Take 1 tablet in the morning and 1 at bedtime" → {"dose": 1, "unit": "tablet", "frequency": 2, "isComplex": true, "schedule": [{"dose": 1, "frequency": 1, "timeOfDay": "morning"}, {"dose": 1, "frequency": 1, "timeOfDay": "bedtime"}], "averageDailyDose": 2}
- "Take 2 tablets on day 1, then 1 tablet daily" → {"dose": 1, "unit": "tablet", "frequency": 1, "isComplex": true, "schedule": [{"dose": 2, "frequency": 1, "dayRange": "day 1"}, {"dose": 1, "frequency": 1, "dayRange": "days 2+"}], "averageDailyDose": 1.5}

Only return valid JSON, no additional text.`
						},
						{
							role: 'user',
							content: `Parse this SIG: "${sig}"`
						}
					],
					temperature: 0.3,
					max_tokens: 500
				})
			});

			if (!response.ok) {
				throw new Error(`OpenAI API error: ${response.status}`);
			}

			const data = await response.json();
			const content = data.choices[0]?.message?.content;
			if (!content) {
				return null;
			}

			// Parse JSON response
			const parsed = JSON.parse(content);
			
			// Validate and normalize
			return this.normalizeParsedSIG(parsed, sig);
		} catch (error) {
			logError(error, 'SIGParserService.parseWithAI');
			return null;
		}
	}

	/**
	 * Parses SIG using enhanced rule-based patterns
	 * @param sig - SIG string
	 * @returns Parsed SIG object
	 */
	private parseWithRules(sig: string): ParsedSIG {
		const normalized = sig.toLowerCase().trim();
		const original = sig;

		// Extract unit
		const unitMatch = normalized.match(/(tablet|tab|capsule|cap|ml|mg|g|unit|units|puff|puffs|dose|doses)/i);
		const unit = unitMatch ? this.normalizeUnit(unitMatch[1]) : 'unit';

		// Check for PRN (as needed)
		const isPRN = /as needed|prn|when needed|if needed/i.test(normalized);

		// Check for complex patterns
		
		// Pattern 1: Range doses (e.g., "Take 1-2 tablets")
		const rangeMatch = normalized.match(/(\d+)\s*-\s*(\d+)\s*(tablet|tab|capsule|cap|ml|mg|g|unit|units|puff|puffs|dose|doses)/i);
		if (rangeMatch) {
			const minDose = parseFloat(rangeMatch[1]);
			const maxDose = parseFloat(rangeMatch[2]);
			const avgDose = (minDose + maxDose) / 2;
			
			// Extract frequency
			let frequency = 1;
			if (normalized.includes('twice') || normalized.includes('2x') || normalized.includes('bid')) {
				frequency = 2;
			} else if (normalized.includes('three times') || normalized.includes('3x') || normalized.includes('tid')) {
				frequency = 3;
			} else if (normalized.includes('four times') || normalized.includes('4x') || normalized.includes('qid')) {
				frequency = 4;
			}

			return {
				dose: minDose,
				unit,
				frequency: isPRN ? 0 : frequency,
				prn: isPRN,
				isComplex: false,
				averageDailyDose: avgDose * frequency,
				instructions: original
			};
		}

		// Pattern 2: Multiple times with different doses (e.g., "Take 1 tablet in the morning and 1 at bedtime")
		// Updated regex to handle cases where unit is not repeated in second part
		const multipleTimesMatch = normalized.match(/(?:take\s+)?(\d+)\s*(tablet|tab|capsule|cap|ml|mg|g|unit|units|puff|puffs|dose|doses)\s+(?:in\s+)?(?:the\s+)?(morning|am|breakfast|daytime).*?(?:and|,)\s*(\d+)\s*(?:(tablet|tab|capsule|cap|ml|mg|g|unit|units|puff|puffs|dose|doses)\s+)?(?:at|in|with)\s+(?:the\s+)?(bedtime|night|pm|evening|dinner)/i);
		if (multipleTimesMatch) {
			const morningDose = parseFloat(multipleTimesMatch[1]);
			// Group 4 is the second dose number, group 6 is the bedtime time
			const eveningDose = parseFloat(multipleTimesMatch[4]);
			const totalDaily = morningDose + eveningDose;

			return {
				dose: morningDose,
				unit,
				frequency: 2,
				isComplex: true,
				schedule: [
					{
						dose: morningDose,
						frequency: 1,
						timeOfDay: 'morning'
					},
					{
						dose: eveningDose,
						frequency: 1,
						timeOfDay: 'bedtime'
					}
				],
				averageDailyDose: totalDaily,
				instructions: original
			};
		}

		// Pattern 3: Tapering schedule (e.g., "Take 2 tablets on day 1, then 1 tablet daily")
		const taperingMatch = normalized.match(/(?:take\s+)?(\d+)\s*(tablet|tab|capsule|cap|ml|mg|g|unit|units|puff|puffs|dose|doses)\s+(?:on\s+)?(?:day\s+)?(\d+).*?(?:then|after|followed by)\s+(\d+)\s*(tablet|tab|capsule|cap|ml|mg|g|unit|units|puff|puffs|dose|doses)\s+(?:daily|once daily|qd)/i);
		if (taperingMatch) {
			const initialDose = parseFloat(taperingMatch[1]);
			const initialDay = parseInt(taperingMatch[3], 10);
			const maintenanceDose = parseFloat(taperingMatch[4]);

			return {
				dose: maintenanceDose,
				unit,
				frequency: 1,
				isComplex: true,
				schedule: [
					{
						dose: initialDose,
						frequency: 1,
						dayRange: `day ${initialDay}`
					},
					{
						dose: maintenanceDose,
						frequency: 1,
						dayRange: `days ${initialDay + 1}+`
					}
				],
				averageDailyDose: initialDose, // Simplified - would need days supply to calculate properly
				instructions: original
			};
		}

		// Pattern 4: Multiple doses at different times (e.g., "Take 1 tablet with breakfast, lunch, and dinner")
		const mealTimesMatch = normalized.match(/(?:take\s+)?(\d+)\s*(tablet|tab|capsule|cap|ml|mg|g|unit|units|puff|puffs|dose|doses)\s+with\s+(breakfast|meals?|food).*?(?:and|,)\s+(lunch|dinner|meals?)/i);
		if (mealTimesMatch) {
			const dose = parseFloat(mealTimesMatch[1]);
			const frequency = 3; // breakfast, lunch, dinner

			return {
				dose,
				unit,
				frequency,
				isComplex: true,
				schedule: [
					{ dose, frequency: 1, timeOfDay: 'breakfast' },
					{ dose, frequency: 1, timeOfDay: 'lunch' },
					{ dose, frequency: 1, timeOfDay: 'dinner' }
				],
				averageDailyDose: dose * frequency,
				instructions: original
			};
		}

		// Default: Simple pattern parsing
		const doseMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(tablet|tab|capsule|cap|ml|mg|g|unit|units|puff|puffs|dose|doses)/i);
		const dose = doseMatch ? parseFloat(doseMatch[1]) : 1;

		// Extract frequency
		let frequency = 1;
		if (normalized.includes('twice') || normalized.includes('2x') || normalized.includes('bid')) {
			frequency = 2;
		} else if (normalized.includes('three times') || normalized.includes('3x') || normalized.includes('tid')) {
			frequency = 3;
		} else if (normalized.includes('four times') || normalized.includes('4x') || normalized.includes('qid')) {
			frequency = 4;
		} else if (normalized.includes('once') || normalized.includes('daily') || normalized.includes('qd')) {
			frequency = 1;
		} else if (normalized.includes('every')) {
			// Extract "every X hours"
			const everyMatch = normalized.match(/every\s*(\d+)\s*(hour|hr|h)/i);
			if (everyMatch) {
				const hours = parseInt(everyMatch[1], 10);
				frequency = Math.round(24 / hours);
			}
		}

		return {
			dose,
			unit,
			frequency: isPRN ? 0 : frequency,
			prn: isPRN,
			isComplex: false,
			instructions: original
		};
	}

	/**
	 * Normalizes parsed SIG from AI or rules
	 * @param parsed - Parsed object
	 * @param original - Original SIG string
	 * @returns Normalized ParsedSIG
	 */
	private normalizeParsedSIG(parsed: any, original: string): ParsedSIG {
		return {
			dose: parsed.dose || 1,
			unit: this.normalizeUnit(parsed.unit || 'unit'),
			frequency: parsed.frequency || 1,
			isComplex: parsed.isComplex || false,
			schedule: parsed.schedule || undefined,
			prn: parsed.prn || false,
			averageDailyDose: parsed.averageDailyDose,
			instructions: parsed.instructions || original
		};
	}

	/**
	 * Normalizes unit name
	 * @param unit - Unit string
	 * @returns Normalized unit
	 */
	private normalizeUnit(unit: string): string {
		const normalized = unit.toLowerCase();
		const unitMap: Record<string, string> = {
			tablet: 'tablet',
			tab: 'tablet',
			tablets: 'tablet',
			capsule: 'capsule',
			cap: 'capsule',
			capsules: 'capsule',
			ml: 'ml',
			mg: 'mg',
			g: 'g',
			unit: 'unit',
			units: 'unit',
			puff: 'puff',
			puffs: 'puff',
			dose: 'dose',
			doses: 'dose'
		};

		return unitMap[normalized] || normalized;
	}
}

/**
 * Default SIG parser service instance
 */
export const sigParserService = new SIGParserService();

