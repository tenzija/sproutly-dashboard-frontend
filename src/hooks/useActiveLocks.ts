'use client';

import { useMemo } from 'react';
import { Address, formatUnits } from 'viem';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { tokenVestingAbi } from '@/abis/minimalAbi';

const DAY = 86_400; // seconds

export type UiLock = {
	/** Source */
	index: number;
	id: `0x${string}`; // computed from (holder,index) via the contract’s pure fn
	raw: {
		beneficiary: Address;
		cliff: bigint;
		start: bigint;
		duration: bigint;
		slicePeriodSeconds: bigint;
		revocable: boolean;
		amountTotal: bigint;
		released: bigint;
		revoked: boolean;
	};

	/** Derived (numbers in seconds / percentages) */
	unlockCliffTs: number; // cliff timestamp
	endLinearTs: number; // cliff + duration
	progressPct: number; // 0..100
	claimable: bigint; // amount vested - released
	claimableFormatted: string; // human with decimals
	totalFormatted: string;
	amountTokenFormatted: string; // same as totalFormatted (your Y equals X for 1:1 base)
	timeRemainingText: string; // e.g., "11 Months, 15 Days"
	unlockDateText: string; // e.g., "September 8, 2026"
};

export function useActiveLocks(opts: {
	vestingAddress: Address;
	tokenDecimals?: number; // default 18
	formatToken?: (v: bigint, decimals: number) => string; // optional custom formatter
}) {
	const { address } = useAccount();
	const vestingAddress = opts.vestingAddress as `0x${string}`;
	const decimals = opts.tokenDecimals ?? 18;

	/** 1) Count of schedules for this beneficiary */
	const { data: countData, isLoading: loadingCount } = useReadContract({
		address: vestingAddress,
		abi: tokenVestingAbi,
		functionName: 'getVestingSchedulesCountByBeneficiary',
		args: address ? [address] : undefined,
		query: {
			enabled: Boolean(address && vestingAddress),
		},
	});

	const count = Number(countData ?? 0);

	/** 2) Batch read each schedule */
	const readList =
		address && count > 0
			? Array.from({ length: count }, (_, i) => ({
					address: vestingAddress,
					abi: tokenVestingAbi,
					functionName: 'getVestingScheduleByAddressAndIndex' as const,
					args: [address, BigInt(i)],
			  }))
			: [];

	const { data: schedulesData, isLoading: loadingSchedules } = useReadContracts(
		{
			contracts: readList,
			query: { enabled: readList.length > 0 },
		}
	);

	/** Small helpers */
	const formatToken = useMemo(
		() =>
			opts.formatToken ??
			((v: bigint, d: number) => {
				const s = formatUnits(v, d);
				// add thousands separators, keep up to 6 decimals (trim trailing)
				const [i, frac = ''] = s.split('.');
				const head = Number(i).toLocaleString();
				const tail = frac.replace(/0+$/, '').slice(0, 6);
				return tail ? `${head}.${tail}` : head;
			}),
		[opts.formatToken] // only recompute if custom formatter changes
	);

	const fmtDate = (ts: number) =>
		new Date(ts * 1000).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});

	const humanRemaining = (now: number, end: number) => {
		const sec = Math.max(0, end - now);
		const days = Math.floor(sec / DAY);
		if (days >= 60) {
			const months = Math.floor(days / 30);
			const remDays = days % 30;
			return `${months} Month${months > 1 ? 's' : ''}, ${remDays} Day${
				remDays !== 1 ? 's' : ''
			}`;
		}
		// ≤ 2 months: show days
		return `${days} Day${days !== 1 ? 's' : ''}`;
	};

	/** 3) Build UI list with derived fields */
	const locks: UiLock[] = useMemo(() => {
		if (!schedulesData) return [];

		const now = Math.floor(Date.now() / 1000);

		return schedulesData
			.map((res, i) => {
				// each result is { status, result } from wagmi
				if (res.status !== 'success') return null;

				const s = res.result as UiLock['raw'];

				// Exclude revoked or fully released
				if (s.revoked) return null;
				if (s.released >= s.amountTotal) return null;

				// Compute claimable (same math as _computeReleasableAmount)
				const cliff = Number(s.cliff);
				const duration = Number(s.duration);
				const slice = Number(s.slicePeriodSeconds);

				let vested = 0n;
				if (now < cliff) vested = 0n;
				else if (duration === 0 || now >= cliff + duration)
					vested = s.amountTotal;
				else {
					const delta = BigInt(now - cliff);
					const periods = slice > 0 ? delta / BigInt(slice) : 0n;
					const vestedSec = periods * BigInt(slice > 0 ? slice : 1);
					vested = (s.amountTotal * vestedSec) / BigInt(duration || 1);
				}

				const claimable = vested > s.released ? vested - s.released : 0n;

				const endLinear = cliff + duration;
				const progressPct =
					now <= cliff
						? 0
						: now >= endLinear
						? 100
						: Math.round(((now - cliff) / (duration || 1)) * 100);

				return {
					index: i + 1,
					id: ('0x' + ''.padStart(64, '0')) as `0x${string}`, // (optional) you can fetch the real id via computeVestingScheduleIdForAddressAndIndex
					raw: s,
					unlockCliffTs: cliff,
					endLinearTs: endLinear,
					progressPct,
					claimable,
					claimableFormatted: formatToken(claimable, decimals),
					totalFormatted: formatToken(s.amountTotal, decimals),
					amountTokenFormatted: formatToken(s.amountTotal, decimals),
					timeRemainingText: humanRemaining(now, endLinear),
					unlockDateText: fmtDate(endLinear),
				} satisfies UiLock;
			})
			.filter(Boolean) as UiLock[];
	}, [schedulesData, decimals, formatToken]);

	return {
		locks,
		isLoading: loadingCount || loadingSchedules,
		count,
	};
}
