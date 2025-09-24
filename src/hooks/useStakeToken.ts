// hooks/useStakeToken.ts
'use client';

import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { erc20Abi, parseUnits } from 'viem';
import { tokenVestingAbi } from '@/abis/minimalAbi';

const DAY = 86_400n;

type StakeParams = {
	vestingAddress: `0x${string}`;
	tokenX: `0x${string}`;
	amount: string; // human amount, e.g. "2500"
	lockMonths: number; // e.g. 6
	cliffDays?: number; // optional extra cliff after lock
	slicePeriodSeconds?: bigint; // default: 1 day
	revocable?: boolean; // default: false
	decimals?: number; // default: 18
};

export function useStakeToken() {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const { writeContractAsync } = useWriteContract();

	const [isApproving, setIsApproving] = useState(false);
	const [isStaking, setIsStaking] = useState(false);
	const [approveHash, setApproveHash] = useState<`0x${string}`>();
	const [stakeHash, setStakeHash] = useState<`0x${string}`>();

	const stake = useCallback(
		async ({
			vestingAddress,
			tokenX,
			amount,
			lockMonths,
			cliffDays = 0,
			slicePeriodSeconds = DAY,
			revocable = false,
			decimals = 18,
		}: StakeParams) => {
			if (!address) throw new Error('Wallet not connected');
			if (!publicClient) throw new Error('No public client');

			const amountWei = parseUnits(amount || '0', decimals);
			if (amountWei <= 0n) throw new Error('Amount must be greater than 0');

			// Simple month calc: 30-day months; replace if you want calendar-accurate months
			const durationSec = BigInt(lockMonths) * 30n * DAY;
			const cliffSec = BigInt(cliffDays) * DAY;

			// 1) Check current allowance
			const allowance = (await publicClient.readContract({
				address: tokenX,
				abi: erc20Abi,
				functionName: 'allowance',
				args: [address, vestingAddress],
			})) as bigint;

			// 2) Approve if needed
			if (allowance < amountWei) {
				setIsApproving(true);
				const hash = await writeContractAsync({
					address: tokenX,
					abi: erc20Abi,
					functionName: 'approve',
					args: [vestingAddress, amountWei], // or MAX_UINT256 for infinite approval
				});
				setApproveHash(hash);
				await publicClient.waitForTransactionReceipt({ hash });
				setIsApproving(false);
			}

			// 3) Create vesting schedule (stake)
			setIsStaking(true);
			const hash2 = await writeContractAsync({
				address: vestingAddress,
				abi: tokenVestingAbi,
				functionName: 'createVestingSchedule',
				args: [
					address, // beneficiary
					cliffSec, // cliffDuration (after lock period)
					slicePeriodSeconds,
					durationSec, // lock duration
					revocable,
					amountWei, // amountLockedX
				],
			});
			setStakeHash(hash2);
			await publicClient.waitForTransactionReceipt({ hash: hash2 });
			setIsStaking(false);

			return { approveHash, stakeHash: hash2 };
		},
		[address, publicClient, writeContractAsync, approveHash]
	);

	return {
		stake,
		isApproving,
		isStaking,
		isMining: isApproving || isStaking,
		approveHash,
		stakeHash,
	};
}
