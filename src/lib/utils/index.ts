/**
 * Central export point for all utility functions
 */

// Validation utilities
export {
	validateDrugName,
	validateNDC,
	validateSIG,
	validateDaysSupply,
	validateRxCUI,
	validateCalculationInput
} from './validation.utils.js';

// Formatting utilities
export {
	formatNDC,
	formatQuantity,
	formatDate,
	formatPercentage,
	formatCurrency,
	truncate,
	capitalize,
	formatNumber
} from './formatting.utils.js';

// Error handling utilities
export {
	createErrorResponse,
	handleAPIError,
	createFailedResponse,
	createSuccessResponse,
	isNetworkError,
	isTimeoutError,
	getUserFriendlyErrorMessage,
	logError
} from './error-handler.utils.js';

