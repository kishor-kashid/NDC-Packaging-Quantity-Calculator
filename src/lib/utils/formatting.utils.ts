/**
 * Formatting utility functions for data display
 */

/**
 * Formats an NDC code to standard 11-digit format with dashes
 * @param ndc - NDC code (can be 10 or 11 digits, with or without dashes)
 * @returns Formatted NDC code (11 digits with dashes: 12345-6789-01)
 */
export function formatNDC(ndc: string): string {
	if (!ndc) return '';

	// Remove all non-digit characters
	const digits = ndc.replace(/\D/g, '');

	// Pad to 11 digits if needed (add leading zero)
	const padded = digits.length === 10 ? `0${digits}` : digits;

	// Format as 5-4-2
	if (padded.length === 11) {
		return `${padded.slice(0, 5)}-${padded.slice(5, 9)}-${padded.slice(9, 11)}`;
	}

	// Return as-is if not standard length
	return ndc;
}

/**
 * Formats a quantity value with unit
 * @param quantity - Quantity value
 * @param unit - Unit of measurement
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted quantity string
 */
export function formatQuantity(quantity: number, unit: string, decimals: number = 0): string {
	if (quantity === undefined || quantity === null || isNaN(quantity)) {
		return 'N/A';
	}

	const formatted = decimals > 0 ? quantity.toFixed(decimals) : quantity.toString();
	return `${formatted} ${unit}`;
}

/**
 * Formats a date to a readable string
 * @param date - Date object or date string
 * @param format - Format style ('short' | 'long' | 'iso')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | undefined, format: 'short' | 'long' | 'iso' = 'short'): string {
	if (!date) return 'N/A';

	const dateObj = typeof date === 'string' ? new Date(date) : date;

	if (isNaN(dateObj.getTime())) {
		return 'Invalid Date';
	}

	switch (format) {
		case 'long':
			return dateObj.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		case 'iso':
			return dateObj.toISOString().split('T')[0];
		case 'short':
		default:
			return dateObj.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
	}
}

/**
 * Formats a percentage value
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
	if (value === undefined || value === null || isNaN(value)) {
		return 'N/A';
	}

	return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a currency value
 * @param value - Currency value
 * @param currency - Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
	if (value === undefined || value === null || isNaN(value)) {
		return 'N/A';
	}

	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency
	}).format(value);
}

/**
 * Truncates a string to a maximum length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add if truncated (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
	if (!str || str.length <= maxLength) {
		return str;
	}

	return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats a number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
	if (num === undefined || num === null || isNaN(num)) {
		return 'N/A';
	}

	return new Intl.NumberFormat('en-US').format(num);
}

