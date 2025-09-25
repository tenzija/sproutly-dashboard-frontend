// hooks/useStakeToken.ts
'use client';

import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { BaseError, erc20Abi, parseUnits } from 'viem';
import { tokenVestingAbi } from '@/abis/minimalAbi';

const DAY = 86_400n;

type StakeParams = {
	vestingAddress: `0x${string}`;
	tokenX: `0x${string}`;
	amount: string; // human, e.g. "2500"
	durationSec: bigint; // lock duration in seconds
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
	const [lastError, setLastError] = useState<string | null>(null);

	const stake = useCallback(
		async ({
			vestingAddress,
			tokenX,
			amount,
			durationSec,
			cliffDays = 0,
			slicePeriodSeconds = DAY,
			revocable = false,
			decimals = 18,
		}: StakeParams) => {
			setLastError(null);

			if (!address) throw new Error('Wallet not connected');
			if (!publicClient) throw new Error('No public client');

			const amountWei = parseUnits(amount || '0', decimals);
			if (amountWei <= 0n) throw new Error('Amount must be greater than 0');

			const cliffSec = BigInt(cliffDays) * DAY;

			try {
				// -------- 1) Check allowance
				const allowance = (await publicClient.readContract({
					address: tokenX,
					abi: erc20Abi,
					functionName: 'allowance',
					args: [address, vestingAddress],
				})) as bigint;

				// -------- 2) Approve if needed (simulate first)
				if (allowance < amountWei) {
					setIsApproving(true);

					// simulate to catch reverts & get a ready-to-send request with gas params
					const { request: approveRequest } =
						await publicClient.simulateContract({
							address: tokenX,
							abi: erc20Abi,
							functionName: 'approve',
							args: [vestingAddress, amountWei],
							account: address,
						});

					const txHash = await writeContractAsync(approveRequest);
					setApproveHash(txHash);
					await publicClient.waitForTransactionReceipt({ hash: txHash });

					setIsApproving(false);
				}

				// -------- 3) Create vesting schedule (simulate first)
				setIsStaking(true);

				const { request: stakeRequest } = await publicClient.simulateContract({
					address: vestingAddress,
					abi: tokenVestingAbi,
					functionName: 'createVestingSchedule',
					args: [
						address, // beneficiary
						cliffSec, // cliffDuration (after lock)
						slicePeriodSeconds, // slice
						durationSec, // lock duration
						revocable,
						amountWei, // amountLockedX
					],
					account: address,
				});

				const txHash2 = await writeContractAsync(stakeRequest);
				setStakeHash(txHash2);
				await publicClient.waitForTransactionReceipt({ hash: txHash2 });

				setIsStaking(false);

				return { approveHash, stakeHash: txHash2 };
			} catch (err) {
				setIsApproving(false);
				setIsStaking(false);

				let message = 'Transaction failed';

				if (err instanceof Error) {
					// viem provides BaseError with helpful fields
					const baseErr = err as BaseError;
					if ('shortMessage' in baseErr && baseErr.shortMessage) {
						message = baseErr.shortMessage;
					} else if ('details' in baseErr && baseErr.details) {
						message = baseErr.details;
					} else {
						message = baseErr.message;
					}
				}

				setLastError(message);
				throw new Error(message);
			}
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
		lastError, // expose last error text for UI toasts/snackbars
	};
}
