import { useCallback, useMemo, useState } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { tokenVestingAbi } from '@/abis/minimalAbi';
import { formatUnits, type Address, type Hex } from 'viem';

const DAY = 86400;

// ---- Types ----
export type VestingSchedule = {
	beneficiary: Address;
	cliff: bigint;
	start: bigint;
	duration: bigint;
	slicePeriodSeconds: bigint;
	revocable: boolean;
	amountTotal: bigint;
	released: bigint;
	revoked: boolean;
	amountLockedX: bigint;
};

function isVestingSchedule(x: unknown): x is VestingSchedule {
	if (typeof x !== 'object' || x === null) return false;
	const o = x as Record<string, unknown>;
	return (
		typeof o.beneficiary === 'string' &&
		typeof o.cliff === 'bigint' &&
		typeof o.start === 'bigint' &&
		typeof o.duration === 'bigint' &&
		typeof o.slicePeriodSeconds === 'bigint' &&
		typeof o.revocable === 'boolean' &&
		typeof o.amountTotal === 'bigint' &&
		typeof o.released === 'bigint' &&
		typeof o.revoked === 'boolean' &&
		typeof o.amountLockedX === 'bigint'
	);
}

type Options = {
	vestingAddress: string;
	tokenDecimals?: number;
	chainId?: number;
	formatToken?: (v: bigint, d: number) => string;
};

// ---- Hook ----
export function useActiveLocks(opts: Options) {
	const { address } = useAccount();
	const vestingAddress = process.env
		.NEXT_PUBLIC_TOKEN_VESTING_ADDRESS as Address;
	const decimals = opts.tokenDecimals ?? 18;
	const chainId = opts.chainId ?? 8453;
	const fmt = useMemo(
		() => opts.formatToken ?? ((v: bigint, d: number) => formatUnits(v, d)),
		[opts.formatToken]
	);

	const [refreshKey, setRefreshKey] = useState(0);
	const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

	// Fetch schedule indexes by beneficiary
	const { data: indexData, isLoading: loadingIndexes } = useReadContract({
		address: vestingAddress,
		abi: tokenVestingAbi,
		functionName: 'getVestingScheduleIndexesByBeneficiary',
		args: address ? [address] : undefined,
		query: { enabled: Boolean(address && vestingAddress) },
		chainId,
		scopeKey: `locks-index-${chainId}-${vestingAddress}-${address}-${refreshKey}`,
	});

	// The schedule indices (0, 1, 2, etc.)
	const indices: number[] = useMemo(() => {
		return indexData
			? (indexData as bigint[]).map((index) => Number(index))
			: [];
	}, [indexData]);

	// Fetching the count of vesting schedules
	const { data: countData, isLoading: loadingCount } = useReadContract({
		address: vestingAddress,
		abi: tokenVestingAbi,
		functionName: 'getVestingSchedulesCountByBeneficiary',
		args: address ? [address] : undefined,
		query: { enabled: Boolean(address && vestingAddress) },
		chainId,
		scopeKey: `locks-count-${chainId}-${vestingAddress}-${
			address ?? '0x0'
		}-${refreshKey}`,
	});
	const count = Number(countData ?? 0);

	// Build ID reads based on fetched indices
	const idReads = useMemo(() => {
		if (!indices.length) return [];
		return indices.map((index) => ({
			address: vestingAddress,
			abi: tokenVestingAbi,
			functionName: 'computeVestingScheduleIdForAddressAndIndex' as const,
			args: [address, BigInt(index)],
			chainId,
		}));
	}, [address, indices, vestingAddress, chainId]);

	const { data: idsData, isLoading: loadingIds } = useReadContracts({
		contracts: idReads,
		query: { enabled: idReads.length > 0 },
		scopeKey: `locks-ids-${chainId}-${vestingAddress}-${address}-${refreshKey}`,
	});

	const ids: Hex[] = useMemo(() => {
		if (!idsData) return [];
		return idsData
			.map((r) => (r.status === 'success' ? (r.result as Hex) : null))
			.filter((x): x is Hex => !!x);
	}, [idsData]);

	// Fetch schedules and claimables using the indices
	const schedAndClaimReads = useMemo(() => {
		if (!ids.length) return [];
		return ids.flatMap((id) => [
			{
				address: vestingAddress,
				abi: tokenVestingAbi,
				functionName: 'getVestingSchedule' as const,
				args: [id],
				chainId,
			},
			{
				address: vestingAddress,
				abi: tokenVestingAbi,
				functionName: 'computeReleasableAmount' as const,
				args: [id],
				chainId,
			},
		]);
	}, [ids, vestingAddress, chainId]);

	const { data: schedClaimData, isLoading: loadingSchedClaims } =
		useReadContracts({
			contracts: schedAndClaimReads,
			query: { enabled: schedAndClaimReads.length > 0 },
			scopeKey: `locks-sched-claim-${chainId}-${vestingAddress}-${address}-${refreshKey}`,
		});

	const humanRemaining = (now: number, end: number) => {
		const sec = Math.max(0, end - now);
		const days = Math.floor(sec / DAY);
		const hours = Math.floor((sec % DAY) / 3600);
		const minutes = Math.floor((sec % 3600) / 60);
		return `${days} Days, ${hours} Hours, ${minutes} Minutes`;
	};

	const locks = useMemo(() => {
		if (!ids.length || !schedClaimData) return [];

		const now = Math.floor(Date.now() / 1000);
		const out: Array<{
			index: number; // The actual index from the contract
			id: Hex;
			raw: VestingSchedule;
			claimableFormatted: string;
			totalFormatted: string;
			lockedFormatted: string;
			timeRemainingText: string;
			unlockDateText: string;
			progressPct: number;
			claimableRaw: bigint;
		}> = [];

		// Filter valid schedules and their corresponding indices
		const validSchedules = [];
		const validIndices = [];

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			const schedRes = schedClaimData[i * 2];
			const claimRes = schedClaimData[i * 2 + 1];

			if (schedRes?.status !== 'success' || claimRes?.status !== 'success')
				continue;

			// ✅ Safe narrowing with type guards
			if (!isVestingSchedule(schedRes.result)) continue;
			if (typeof claimRes.result !== 'bigint') continue;

			const s = schedRes.result;
			const claimable = claimRes.result;

			// Skip fully claimed or revoked schedules
			if (s.revoked || s.released >= s.amountTotal) continue;

			// Store valid schedules and their corresponding indices
			validSchedules.push(s);
			validIndices.push(indices[i]); // Use the actual contract index

			// Calculate the progress based on released amount instead of time
			let progressPct = 0;
			if (s.amountTotal > 0) {
				progressPct = Math.round(
					(Number(s.released) / Number(s.amountTotal)) * 100
				);
			}

			const cliff = Number(s.cliff);

			// Use the valid contract index and push it to the list
			out.push({
				index: validIndices[validIndices.length - 1], // Correct contract index from filtered valid schedules
				id,
				raw: s,
				claimableFormatted: fmt(claimable, decimals),
				claimableRaw: claimable,
				totalFormatted: fmt(s.amountTotal, decimals),
				lockedFormatted: fmt(s.amountTotal - s.released, decimals),
				timeRemainingText: humanRemaining(now, cliff),
				unlockDateText: new Date(cliff * 1000).toLocaleDateString(),
				progressPct,
			});
		}

		return out;
	}, [ids, schedClaimData, decimals, fmt, indices]);

	return {
		locks,
		isLoading:
			loadingCount || loadingIds || loadingSchedClaims || loadingIndexes,
		count,
		refetch,
	};
}
