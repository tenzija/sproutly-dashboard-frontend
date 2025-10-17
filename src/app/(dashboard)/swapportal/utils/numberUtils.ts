// Utility functions for number formatting and validation
// Used across BridgeCBY, Review, and SetStacking components

/**
 * Validates if a string contains only numbers and decimal points
 * @param value - The string to validate
 * @returns boolean - True if valid, false otherwise
 */
export const isValidNumberInput = (value: string): boolean => {
	return /^\d*\.?\d*$/.test(value) || value === '';
};

/**
 * Formats large numbers to avoid scientific notation
 * Converts to human-readable format with K, M, B, T suffixes
 * @param numStr - The number as a string
 * @returns string - Formatted number with appropriate suffix
 */
export const formatLargeNumber = (numStr: string): string => {
	const num = parseFloat(numStr);
	if (isNaN(num)) return '0';

	// Handle extremely large numbers
	if (num >= 1e12) {
		return (num / 1e12).toFixed(2) + 'T';
	} else if (num >= 1e9) {
		return (num / 1e9).toFixed(2) + 'B';
	} else if (num >= 1e6) {
		return (num / 1e6).toFixed(2) + 'M';
	} else if (num >= 1e3) {
		return (num / 1e3).toFixed(2) + 'K';
	} else {
		return num.toLocaleString();
	}
};

/**
 * Calculates destination amount based on source amount
 * @param sourceAmount - The source amount as string
 * @param multiplier - The conversion multiplier (default: 0.2)
 * @returns string - Formatted destination amount
 */
export const calculateDestinationAmount = (
	sourceAmount: string,
	multiplier: number = 1
): string => {
	if (!sourceAmount) return '0';

	const numAmount = parseFloat(sourceAmount);
	if (isNaN(numAmount)) return '0';

	const result = numAmount * multiplier;
	return formatLargeNumber(result.toString());
};

/**
 * Formats display amount with fallback to default value
 * @param amount - The amount to format
 * @param defaultValue - Default value if amount is empty (default: "12,500")
 * @returns string - Formatted amount or default value
 */
export const formatDisplayAmount = (
	amount: string,
	defaultValue: string = '0'
): string => {
	if (!amount) return defaultValue;
	return formatLargeNumber(amount);
};
