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
