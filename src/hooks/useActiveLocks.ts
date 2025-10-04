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
	const fmt = opts.formatToken ?? ((v: bigint, d: number) => formatUnits(v, d));

	// manual refresh
	const [refreshKey, setRefreshKey] = useState(0);
	const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

	/* 1) Count schedules */
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

	/* 2) Build id reads */
	const idReads = useMemo(() => {
		if (!address || count <= 0) return [];
		return Array.from({ length: count }, (_, i) => ({
			address: vestingAddress,
			abi: tokenVestingAbi,
			functionName: 'computeVestingScheduleIdForAddressAndIndex' as const,
			args: [address, BigInt(i)],
			chainId,
		}));
	}, [address, count, vestingAddress, chainId]);

	const { data: idsData, isLoading: loadingIds } = useReadContracts({
		contracts: idReads,
		query: { enabled: idReads.length > 0 },
		scopeKey: `locks-ids-${chainId}-${vestingAddress}-${
			address ?? '0x0'
		}-${refreshKey}`,
	});

	const ids: Hex[] = useMemo(() => {
		if (!idsData) return [];
		return idsData
			.map((r) => (r.status === 'success' ? (r.result as Hex) : null))
			.filter((x): x is Hex => !!x);
	}, [idsData]);

	/* 3) Schedules + claimables */
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
			scopeKey: `locks-sched-claim-${chainId}-${vestingAddress}-${
				address ?? '0x0'
			}-${refreshKey}`,
		});

	const humanRemaining = (now: number, end: number) => {
		const sec = Math.max(0, end - now);
		const days = Math.floor(sec / DAY);
		const hours = Math.floor((sec % DAY) / 3600);
		const minutes = Math.floor((sec % 3600) / 60);
		return `${days} Days, ${hours} Hours, ${minutes} Minutes`;
	};

	/* 4) Shape UI locks */
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
		}> = [];

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

			if (s.revoked || s.released >= s.amountTotal) continue;

			const cliff = Number(s.cliff);
			const duration = Number(s.duration);

			let progressPct = 0;
			if (now < cliff) progressPct = 0;
			else if (duration === 1) progressPct = 100;
			else {
				const t = Math.min(now, cliff + duration);
				const num = Math.max(0, t - cliff);
				progressPct = Math.round((num / Math.max(1, duration)) * 100);
			}

			const unlockAt = duration === 1 ? cliff : cliff + duration;

			out.push({
				index: i + 1,
				id,
				raw: s,
				claimableFormatted: fmt(claimable, decimals),
				totalFormatted: fmt(s.amountTotal, decimals),
				lockedFormatted: fmt(s.amountTotal - s.released, decimals),
				timeRemainingText: humanRemaining(now, unlockAt),
				unlockDateText: new Date(unlockAt * 1000).toLocaleDateString(),
				progressPct,
			});
		}

		return out;
	}, [ids, schedClaimData, decimals, fmt]);

	return {
		locks,
		isLoading: loadingCount || loadingIds || loadingSchedClaims,
		count,
		refetch,
	};
}
