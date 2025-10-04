'use client';

import { useCallback, useState } from 'react';
import {
	useAccount,
	usePublicClient,
	useWriteContract,
	useChainId,
} from 'wagmi';
import type { Address, Hex, TransactionReceipt } from 'viem';
import { parseUnits } from 'viem';
import { useEvmError } from '@/hooks/useEvmError';
import { erc20Abi, tokenVestingAbi } from '@/abis/minimalAbi';
import { base } from 'viem/chains';

export type StakeParams = {
	vestingAddress: Address; // TokenVesting proxy
	tokenX: Address; // CBY (locked token)
	amount: string; // human units, e.g. "123.45"
	decimals?: number; // default 18
	durationSec: bigint; // lock duration in seconds
	cliffDays?: number; // optional; default 0 days
	slicePeriodSeconds?: bigint; // default 86_400n
	revocable?: boolean; // default true
	autoApprove?: boolean; // default true
	infiniteApproval?: boolean; // default false
};

export type StakeSuccess = { ok: true; hash: Hex; receipt: TransactionReceipt };
export type StakeFailure = {
	ok: false;
	error: { userMessage: string; devMessage?: string };
};
export type StakeResult = StakeSuccess | StakeFailure;

export function useStakeToken() {
	const { address } = useAccount();
	const chainId = useChainId();
	const publicClient = usePublicClient({ chainId: base.id });
	const { writeContractAsync } = useWriteContract();
	const { handleTx } = useEvmError({
		contractHints: [
			{
				match: /TokenVesting:\s*startDate not set/i,
				message: 'Vesting is not configured yet.',
			},
			{
				match: /TokenVesting:\s*unauthorized create/i,
				message: 'You are not allowed to create this schedule.',
			},
			{
				match: /TokenVesting:\s*zero lock/i,
				message: 'Amount must be more than zero.',
			},
			{
				match: /TokenVesting:\s*slice > 0/i,
				message: 'The slice time must be more than zero.',
			},
			{
				match: /TokenVesting:\s*linear needs duration/i,
				message: 'Linear vesting needs a positive duration.',
			},
			{
				match: /TokenVesting:\s*insufficient reward funds/i,
				message: 'Rewards vault is empty right now.',
			},
		],
	});

	const [isApproving, setIsApproving] = useState(false);
	const [isStaking, setIsStaking] = useState(false);
	const [txHash, setTxHash] = useState<Hex | undefined>();

	const stake = useCallback(
		async (p: StakeParams): Promise<StakeResult> => {
			const {
				vestingAddress,
				tokenX,
				amount,
				decimals = 18,
				durationSec,
				cliffDays = 0,
				slicePeriodSeconds = 86_400n,
				revocable = true,
				autoApprove = true,
				infiniteApproval = true,
			} = p;

			if (!address) {
				return {
					ok: false,
					error: { userMessage: 'Please connect your wallet.' },
				};
			}
			if (!publicClient) {
				return {
					ok: false,
					error: { userMessage: 'No RPC client available.' },
				};
			}

			try {
				const amountX = parseUnits(amount || '0', decimals);

				// 1) Optional approve flow
				if (autoApprove) {
					setIsApproving(true);
					await handleTx(async () => {
						const allowance = (await publicClient.readContract({
							address: tokenX,
							abi: erc20Abi,
							functionName: 'allowance',
							args: [address, vestingAddress],
						})) as bigint;

						if (amountX <= allowance) return 'skip-approve';

						const approveValue = infiniteApproval ? 2n ** 256n - 1n : amountX;

						const { request } = await publicClient.simulateContract({
							address: tokenX,
							abi: erc20Abi,
							functionName: 'approve',
							args: [vestingAddress, approveValue],
							account: address,
						});

						const hash = await writeContractAsync(request);
						await publicClient.waitForTransactionReceipt({ hash });
						return hash;
					});
					setIsApproving(false);
				}

				// 2) Create vesting schedule
				setIsStaking(true);
				const cliffSeconds = BigInt(cliffDays) * 86_400n;

				const { request } = await publicClient.simulateContract({
					address: vestingAddress,
					abi: tokenVestingAbi,
					functionName: 'createVestingSchedule',
					args: [
						address, // beneficiary
						cliffSeconds,
						slicePeriodSeconds,
						durationSec,
						revocable,
						amountX,
					],
					account: address,
				});

				const hash = await writeContractAsync(request);
				setTxHash(hash);
				const receipt = await publicClient.waitForTransactionReceipt({ hash });

				setIsStaking(false);
				return { ok: true, hash, receipt };
			} catch (err: unknown) {
				setIsApproving(false);
				setIsStaking(false);

				const friendly =
					err && typeof err === 'object' && 'userMessage' in err
						? (err as { userMessage: string; devMessage?: string })
						: { userMessage: 'Something went wrong. Please try again.' };

				return { ok: false, error: friendly };
			}
		},
		[address, publicClient, writeContractAsync, chainId, handleTx]
	);

	return {
		stake,
		isApproving,
		isStaking,
		txHash,
	};
}
