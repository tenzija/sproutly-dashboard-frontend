// Utility functions for number formatting and validation
// Used across BridgeCBY, Review, and SetStacking components

/**
 * Validates amount input:
 * - up to 8 integer digits (max 99,999,999.99)
 * - up to 2 decimal digits
 * - no leading zeros (except single '0' before decimals)
 * - allows intermediate typing states (e.g. '', '.', '0.', '12.')
 * - enforces min 0.01 once two decimals are present
 */
export const isValidNumberInput = (value: string): boolean => {
  if (value === '') return true; // allow empty while typing

  // digits with an optional single dot only
  if (!/^\d*\.?\d*$/.test(value)) return false;

  const [intPartRaw = '', decPart = ''] = value.split('.');
  const intPart = intPartRaw;

  // Disallow multiple leading zeros like "00", "012", "00000001"
  if (intPart.length > 1 && intPart.startsWith('0')) return false;

  // Max 8 integer digits (except allow '' for entries like ".5" while typing, and allow single '0')
  if (intPart !== '' && intPart !== '0' && intPart.length > 8) return false;

  // Max 2 decimals
  if (decPart.length > 2) return false;

  // Allow trailing dot while typing (e.g., "12.")
  if (value.endsWith('.')) return true;

  // Enforce minimum 0.01 once two decimals are present for 0.xx or .xx
  if ((intPart === '' || intPart === '0') && decPart.length === 2 && Number(decPart) < 1) {
    // blocks "0.00" and ".00"
    return false;
  }

  return true;
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
