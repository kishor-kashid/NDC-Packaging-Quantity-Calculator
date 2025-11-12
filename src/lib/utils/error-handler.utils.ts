/**
 * Error handling utility functions
 */

import type { ErrorResponse, APIResponse } from '../types/index.js';

/**
 * Creates a standardized error response
 * @param message - Error message
 * @param code - Optional error code
 * @param details - Optional additional details
 * @returns Error response object
 */
export function createErrorResponse(
	message: string,
	code?: string,
	details?: unknown
): ErrorResponse {
	return {
		message,
		code,
		details
	};
}

/**
 * Handles API errors and creates appropriate error responses
 * @param error - Error object or unknown error
 * @returns Error response
 */
export function handleAPIError(error: unknown): ErrorResponse {
	// Handle Error objects
	if (error instanceof Error) {
		return createErrorResponse(error.message, 'API_ERROR', {
			name: error.name,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}

	// Handle string errors
	if (typeof error === 'string') {
		return createErrorResponse(error, 'API_ERROR');
	}

	// Handle objects with message property
	if (error && typeof error === 'object' && 'message' in error) {
		return createErrorResponse(
			String(error.message),
			'code' in error ? String(error.code) : 'API_ERROR',
			error
		);
	}

	// Unknown error type
	return createErrorResponse('An unknown error occurred', 'UNKNOWN_ERROR', error);
}

/**
 * Creates a failed API response
 * @param error - Error to convert to response
 * @returns Failed API response
 */
export function createFailedResponse<T>(error: unknown): APIResponse<T> {
	return {
		success: false,
		error: handleAPIError(error)
	};
}

/**
 * Creates a successful API response
 * @param data - Response data
 * @returns Successful API response
 */
export function createSuccessResponse<T>(data: T): APIResponse<T> {
	return {
		success: true,
		data
	};
}

/**
 * Checks if an error is a network error
 * @param error - Error to check
 * @returns True if network error
 */
export function isNetworkError(error: unknown): boolean {
	if (error instanceof Error) {
		return (
			error.message.includes('fetch') ||
			error.message.includes('network') ||
			error.message.includes('ECONNREFUSED') ||
			error.message.includes('ETIMEDOUT')
		);
	}
	return false;
}

/**
 * Checks if an error is a timeout error
 * @param error - Error to check
 * @returns True if timeout error
 */
export function isTimeoutError(error: unknown): boolean {
	if (error instanceof Error) {
		return (
			error.message.includes('timeout') ||
			error.message.includes('ETIMEDOUT') ||
			error.name === 'TimeoutError'
		);
	}
	return false;
}

/**
 * Gets user-friendly error message
 * @param error - Error object
 * @returns User-friendly message
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
	const errorResponse = handleAPIError(error);

	// Map technical errors to user-friendly messages
	if (isNetworkError(error)) {
		return 'Unable to connect to the server. Please check your internet connection and try again.';
	}

	if (isTimeoutError(error)) {
		return 'The request took too long to complete. Please try again.';
	}

	// Return the error message if it's already user-friendly
	if (errorResponse.message && !errorResponse.message.includes('Error:')) {
		return errorResponse.message;
	}

	// Default fallback
	return 'An error occurred while processing your request. Please try again.';
}

/**
 * Logs an error (only in development)
 * @param error - Error to log
 * @param context - Additional context
 */
export function logError(error: unknown, context?: string): void {
	if (process.env.NODE_ENV === 'development') {
		const contextMsg = context ? `[${context}] ` : '';
		console.error(`${contextMsg}Error:`, error);
	}
}

