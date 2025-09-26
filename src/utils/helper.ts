// utils/units.ts
import { formatEther, parseEther, formatUnits, parseUnits } from 'viem';

/** wei -> ETH as decimal string ("1.0", "0.1234", …) */
export const weiToEth = (wei: bigint | string): string =>
	formatEther(typeof wei === 'string' ? BigInt(wei) : wei);

/** ETH (e.g. "0.42") -> wei as bigint */
export const ethToWei = (eth: string): bigint => parseEther(eth);

/** Generic formatter: smallest units -> human units (e.g., token with N decimals) */
export const formatToken = (
	amount: bigint | string,
	decimals: number
): string =>
	formatUnits(typeof amount === 'string' ? BigInt(amount) : amount, decimals);

/** Generic parser: human units -> smallest units (e.g., "1.5" -> 1500000 for 6 decimals) */
export const parseToken = (amount: string, decimals: number): bigint =>
	parseUnits(amount, decimals);

/** Works with string/number/bigint, keeps any decimals. */
export const formatThousands = (v: string | number | bigint): string => {
	const s = typeof v === 'string' ? v : v.toString();
	const [int, frac] = s.split('.');
	const intWithCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return frac ? `${intWithCommas}.${frac}` : intWithCommas;
};

export const SECONDS_PER_DAY = 86_400n;
export const SECONDS_PER_MONTH_30 = 30n * SECONDS_PER_DAY;

export function durationLabelFromSeconds(duration: bigint): string {
	if (duration <= 0n) return '0';
	// Prefer Months when exact multiple of 30 days
	if (duration % SECONDS_PER_MONTH_30 === 0n) {
		const months = Number(duration / SECONDS_PER_MONTH_30);
		return `${months} ${months === 1 ? 'Month' : 'Months'}`;
	}
	if (duration % SECONDS_PER_DAY === 0n) {
		const days = Number(duration / SECONDS_PER_DAY);
		return `${days} ${days === 1 ? 'Day' : 'Days'}`;
	}
	// Fallback to seconds
	return `${Number(duration)} sec`;
}
