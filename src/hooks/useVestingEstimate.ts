// hooks/useVestingEstimate.ts
'use client';

import { useMemo } from 'react';
import { useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { calculationLayerAbi, tokenVestingAbi } from '@/abis/minimalAbi';

const DECIMALS = 18n;
const WAD = 10n ** DECIMALS;
const DAY = 86400n;

export type VestingEstimateInput = {
	vestingAddress: `0x${string}`;
	/** human string in token X units, e.g. "2500" (18d) */
	amountX: string;
	/** lock duration in seconds (e.g. 6 months = 6 * 30 * 86400) */
	durationSec: bigint;
	/** optional extra cliff AFTER the lock (seconds) – affects dates only */
	cliffSec?: bigint;
	/** optional chainId if you need to force a specific chain */
	chainId?: number;
};

export type VestingEstimate = {
	/** ratio from calc layer, scaled by 1e18 */
	ratioWad?: bigint;
	/** total reward Y in wei */
	totalY?: bigint;
	/** base (1:1) part if ratio>1, else 0 */
	baseY?: bigint;
	/** bonus linear part if ratio>1, else 0 */
	bonusY?: bigint;
	/** formatted strings for UI */
	formatted: {
		totalY?: string;
		baseY?: string;
		bonusY?: string;
		amountX: string;
	};
	/** dates (based on startDate, if set) */
	dates?: {
		startDate?: number; // seconds
		cliffTime?: number; // seconds
		endLinear?: number; // seconds (cliff + duration)
	};
	/** loading/error flags */
	isLoading: boolean;
	error?: unknown;
};

export function useVestingEstimate(
	input: VestingEstimateInput
): VestingEstimate {
	const {
		vestingAddress,
		amountX,
		durationSec,
		cliffSec = 0n,
		chainId,
	} = input;

	// 1) read CalculationLayer address
	const getCL = useReadContract({
		address: vestingAddress,
		abi: tokenVestingAbi,
		functionName: 'getCalculationLayer',
		chainId,
	});

	// 2) read startDate (optional, for dates)
	const getStart = useReadContract({
		address: vestingAddress,
		abi: tokenVestingAbi,
		functionName: 'startDate',
		chainId,
	});

	// 3) call calculateUserRatio(daysLocked, 1)
	const daysLocked = durationSec / DAY;
	const calcRatio = useReadContract({
		address: (getCL.data as `0x${string}` | undefined) ?? undefined,
		abi: calculationLayerAbi,
		functionName: 'calculateUserRatio',
		args: [daysLocked, 1n],
		chainId,
		query: {
			enabled: Boolean(getCL.data), // don’t call until we have the address
		},
	});

	// Destructure the exact primitives we read inside the memo
	const { isLoading: clLoading, error: clError } = getCL;
	const {
		data: startData,
		isLoading: startLoading,
		error: startError,
	} = getStart;
	const {
		data: ratioData,
		isLoading: ratioLoading,
		error: ratioError,
	} = calcRatio;

	const result = useMemo<VestingEstimate>(() => {
		const amountWei = parseUnits(amountX || '0', Number(DECIMALS));
		const ratio = (ratioData as bigint | undefined) ?? undefined;

		let baseY: bigint | undefined;
		let bonusY: bigint | undefined;
		let totalY: bigint | undefined;

		if (ratio !== undefined) {
			if (ratio <= WAD) {
				// single lump right after cliff
				totalY = (amountWei * ratio) / WAD;
				baseY = 0n;
				bonusY = 0n;
			} else {
				baseY = amountWei; // 1:1
				bonusY = (amountWei * (ratio - WAD)) / WAD; // linear over duration
				totalY = baseY + bonusY;
			}
		}

		// dates (only if startDate is set)
		let dates: VestingEstimate['dates'];
		const sd = startData as bigint | undefined;
		if (sd && sd > 0n) {
			const cliffTime = Number(sd) + Number(durationSec) + Number(cliffSec);
			dates = {
				startDate: Number(sd),
				cliffTime,
				endLinear: cliffTime + Number(durationSec),
			};
		}

		return {
			ratioWad: ratio,
			totalY,
			baseY,
			bonusY,
			formatted: {
				totalY:
					totalY !== undefined
						? formatUnits(totalY, Number(DECIMALS))
						: undefined,
				baseY:
					baseY !== undefined
						? formatUnits(baseY, Number(DECIMALS))
						: undefined,
				bonusY:
					bonusY !== undefined
						? formatUnits(bonusY, Number(DECIMALS))
						: undefined,
				amountX, // already human
			},
			dates,
			isLoading: clLoading || ratioLoading || startLoading,
			error: clError || ratioError || startError,
		};
	}, [
		amountX,
		durationSec,
		cliffSec,
		// memo inputs actually read:
		ratioData,
		startData,
		clLoading,
		ratioLoading,
		startLoading,
		clError,
		ratioError,
		startError,
	]);

	return result;
}
