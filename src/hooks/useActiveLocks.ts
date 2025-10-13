import { useCallback, useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { tokenVestingAbi } from '@/abis/minimalAbi';
import { formatUnits, type Address, type Hex } from 'viem';

const DAY = 86400;

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
	vestingAddress: Address; // <- required
	tokenDecimals?: number;
	chainId?: number;
	formatToken?: (v: bigint, d: number) => string;
};

export function useActiveLocks(opts: Options) {
	const { address } = useAccount();

	// ✅ use the provided address; fallback to env only if needed
	const vestingAddress =
		opts.vestingAddress ??
		(process.env.NEXT_PUBLIC_TOKEN_VESTING_ADDRESS as Address);

	const decimals = opts.tokenDecimals ?? 18;
	const chainId = opts.chainId ?? 8453;
	const fmt = useMemo(
		() => opts.formatToken ?? ((v: bigint, d: number) => formatUnits(v, d)),
		[opts.formatToken]
	);

	// ——— Indexes ———
	const {
		data: indexData,
		isLoading: loadingIndexes,
		refetch: refetchIndexes, // <- grab wagmi refetch
	} = useReadContract({
		address: vestingAddress,
		abi: tokenVestingAbi,
		functionName: 'getVestingScheduleIndexesByBeneficiary',
		args: address ? [address] : undefined,
		chainId,
		query: {
			enabled: Boolean(address && vestingAddress),
			staleTime: 0, // ensure not considered fresh
			refetchOnMount: 'always', // always re-run on remount
		},
		// watch: true,               // optional: auto on new blocks
		scopeKey: `locks-index-${chainId}-${vestingAddress}-${address}`,
	});

	const indices: number[] = useMemo(
		() => (indexData ? (indexData as bigint[]).map((i) => Number(i)) : []),
		[indexData]
	);

	// ——— Count ———
	const {
		data: countData,
		isLoading: loadingCount,
		refetch: refetchCount,
	} = useReadContract({
		address: vestingAddress,
		abi: tokenVestingAbi,
		functionName: 'getVestingSchedulesCountByBeneficiary',
		args: address ? [address] : undefined,
		chainId,
		query: { enabled: Boolean(address && vestingAddress), staleTime: 0 },
		scopeKey: `locks-count-${chainId}-${vestingAddress}-${address ?? '0x0'}`,
	});
	const count = Number(countData ?? 0);

	// ——— IDs ———
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

	const {
		data: idsData,
		isLoading: loadingIds,
		refetch: refetchIds,
	} = useReadContracts({
		contracts: idReads,
		query: { enabled: idReads.length > 0, staleTime: 0 },
		scopeKey: `locks-ids-${chainId}-${vestingAddress}-${address}`,
	});

	const ids: Hex[] = useMemo(() => {
		if (!idsData) return [];
		return idsData
			.map((r) => (r.status === 'success' ? (r.result as Hex) : null))
			.filter((x): x is Hex => !!x);
	}, [idsData]);

	// ——— Schedules + Claimables ———
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

	const {
		data: schedClaimData,
		isLoading: loadingSchedClaims,
		refetch: refetchSchedClaims,
	} = useReadContracts({
		contracts: schedAndClaimReads,
		query: { enabled: schedAndClaimReads.length > 0, staleTime: 0 },
		scopeKey: `locks-sched-claim-${chainId}-${vestingAddress}-${address}`,
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
			index: number;
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

		for (let i = 0; i < ids.length; i++) {
			const id = ids[i];
			const schedRes = schedClaimData[i * 2];
			const claimRes = schedClaimData[i * 2 + 1];

			if (schedRes?.status !== 'success' || claimRes?.status !== 'success')
				continue;
			if (!isVestingSchedule(schedRes.result)) continue;
			if (typeof claimRes.result !== 'bigint') continue;

			const s = schedRes.result;
			const claimable = claimRes.result;

			if (s.revoked || s.released >= s.amountTotal) continue;

			let progressPct = 0;
			if (s.amountTotal > 0) {
				progressPct = Math.round(
					(Number(s.released) / Number(s.amountTotal)) * 100
				);
			}

			const cliff = Number(s.cliff);

			out.push({
				index: indices[i], // original index from beneficiary list
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

	// ✅ Real refetch that actually re-queries wagmi
	const refetch = useCallback(async () => {
		await Promise.all([
			refetchIndexes?.(),
			refetchCount?.(),
			refetchIds?.(),
			refetchSchedClaims?.(),
		]);
	}, [refetchIndexes, refetchCount, refetchIds, refetchSchedClaims]);

	return {
		locks,
		isLoading:
			loadingCount || loadingIds || loadingSchedClaims || loadingIndexes,
		count,
		refetch, // call this to force fresh reads
	};
}
