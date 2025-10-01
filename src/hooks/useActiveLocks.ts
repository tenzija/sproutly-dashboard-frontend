import { useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { tokenVestingAbi } from '@/abis/minimalAbi';
import { formatUnits } from 'viem';

const DAY = 86400; // seconds per day

export function useActiveLocks(opts: {
	vestingAddress: string;
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

	console.log('schedulesData', schedulesData);

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

				const s = res.result;

				// Exclude revoked or fully released schedules
				if (s.revoked || s.released >= s.amountTotal) return null;

				// Calculate the claimable amount
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

				// Calculate the progress percentage
				const progressPct =
					now <= cliff
						? 0
						: now >= cliff + duration
						? 100
						: Math.round(((now - cliff) / (duration || 1)) * 100);

				// Calculate the remaining time and unlock date
				const unlockDate = cliff + duration;
				const remainingTime = humanRemaining(now, unlockDate);

				// Format the data for the UI
				return {
					index: i + 1,
					id: ('0x' + ''.padStart(64, '0')) as `0x${string}`, // You can fetch the real id
					raw: s,
					claimableFormatted: formatToken(claimable, decimals),
					totalFormatted: formatToken(s.amountTotal, decimals),
					lockedFormatted: formatToken(s.amountTotal - s.released, decimals), // Locked = Total - Released
					timeRemainingText: remainingTime,
					unlockDateText: new Date(unlockDate * 1000).toLocaleDateString(),
					progressPct,
				};
			})
			.filter(Boolean);
	}, [schedulesData, decimals, formatToken]);

	return {
		locks,
		isLoading: loadingCount || loadingSchedules,
		count,
	};
}
