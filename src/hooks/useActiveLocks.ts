import { useCallback, useMemo, useState } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { tokenVestingAbi } from '@/abis/minimalAbi';
import { formatUnits } from 'viem';

const DAY = 86400; // seconds per day

type Options = {
	vestingAddress: string;
	tokenDecimals?: number; // default 18
	chainId?: number; // default 8453 (Base)
	formatToken?: (v: bigint, decimals: number) => string; // optional custom formatter
};

export function useActiveLocks(opts: Options) {
	const { address } = useAccount();
	const vestingAddress = opts.vestingAddress as `0x${string}`;
	const decimals = opts.tokenDecimals ?? 18;
	const chainId = opts.chainId ?? 8453;

	// 🔁 force re-query by changing scopeKey when refetch() is called
	const [refreshKey, setRefreshKey] = useState(0);
	const refetch = useCallback(() => setRefreshKey((k) => k + 1), []);

	/** 1) Count of schedules for this beneficiary */
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

	/** 2) Build the batch read list (memoized) */
	const readList = useMemo(() => {
		if (!address || count <= 0) return [];
		return Array.from({ length: count }, (_, i) => ({
			address: vestingAddress,
			abi: tokenVestingAbi,
			functionName: 'getVestingScheduleByAddressAndIndex' as const,
			args: [address, BigInt(i)],
			chainId,
		}));
	}, [address, count, vestingAddress, chainId]);

	/** 3) Batch read each schedule */
	const { data: schedulesData, isLoading: loadingSchedules } = useReadContracts(
		{
			contracts: readList,
			// allowFailure stays true (default) so we can check result.status below
			query: { enabled: readList.length > 0 },
			scopeKey: `locks-schedules-${chainId}-${vestingAddress}-${
				address ?? '0x0'
			}-${refreshKey}`,
		}
	);

	/** Helper to format the tokens */
	const formatToken =
		opts.formatToken ?? ((v: bigint, d: number) => formatUnits(v, d));

	/** Helper to calculate the remaining time */
	const humanRemaining = (now: number, end: number) => {
		const sec = Math.max(0, end - now);
		const days = Math.floor(sec / DAY);
		const hours = Math.floor((sec % DAY) / 3600);
		const minutes = Math.floor((sec % 3600) / 60);
		return `${days} Days, ${hours} Hours, ${minutes} Minutes`;
	};

	/** Build the UI data */
	const locks = useMemo(() => {
		if (!schedulesData) return [];

		const now = Math.floor(Date.now() / 1000);

		return schedulesData
			.map((res, i) => {
				if (res.status !== 'success') return null;
				console.log('locked tokens', res.result);
				const s = res.result as {
					cliff: bigint;
					duration: bigint;
					slicePeriodSeconds: bigint;
					amountTotal: bigint;
					released: bigint;
					revoked: boolean;
					// ... other fields from your ABI if needed
				};

				// Exclude revoked or fully released schedules
				if (s.revoked || s.released >= s.amountTotal) return null;

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

				const progressPct =
					now <= cliff
						? 0
						: now >= cliff + duration
						? 100
						: Math.round(((now - cliff) / (duration || 1)) * 100);

				const unlockDate = cliff + duration;
				const remainingTime = humanRemaining(now, unlockDate);

				return {
					index: i + 1,
					id: ('0x' + ''.padStart(64, '0')) as `0x${string}`, // TODO: replace with real id if available
					raw: s,
					claimableFormatted: formatToken(claimable, decimals),
					totalFormatted: formatToken(s.amountTotal, decimals),
					lockedFormatted: formatToken(s.amountTotal - s.released, decimals),
					timeRemainingText: remainingTime,
					unlockDateText: new Date(unlockDate * 1000).toLocaleDateString(),
					progressPct,
				};
			})
			.filter((x): x is NonNullable<typeof x> => Boolean(x));
	}, [schedulesData, decimals, formatToken]);

	return {
		locks,
		isLoading: loadingCount || loadingSchedules,
		count,
		refetch, // ⬅️ expose this so the parent can refresh on demand
	};
}
