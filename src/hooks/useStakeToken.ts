// hooks/useStakeToken.ts
'use client';

import { useCallback, useState } from 'react';
import {
	useAccount,
	usePublicClient,
	useWriteContract,
	useChainId,
	useSwitchChain,
} from 'wagmi';
import {
	BaseError,
	erc20Abi,
	parseUnits,
	decodeErrorResult,
	Hex,
	type Abi,
} from 'viem';
import { tokenVestingAbi } from '@/abis/minimalAbi';

const DAY = 86_400n;
const BASE_CHAIN_ID = 8453 as const;

type TxErrorCode = 'REJECTED' | 'REVERT' | 'RPC' | 'UNKNOWN';

export type TxOutcome =
	| { ok: true; approveHash?: `0x${string}`; stakeHash: `0x${string}` }
	| { ok: false; code: TxErrorCode; message: string };

type StakeParams = {
	vestingAddress: `0x${string}`;
	tokenX: `0x${string}`;
	amount: string;
	durationSec: bigint;
	cliffDays?: number;
	slicePeriodSeconds?: bigint;
	revocable?: boolean;
	decimals?: number;
};

const stdErrorAbi = [
	{
		type: 'error',
		name: 'Error',
		inputs: [{ name: 'message', type: 'string' }],
	},
] as const satisfies Abi;

function decodeRevertMessage(err: unknown): {
	code: TxErrorCode;
	message: string;
} {
	let message = 'Transaction failed';
	let code: TxErrorCode = 'UNKNOWN';

	const setMsg = (m?: string) => {
		if (m && typeof m === 'string') message = m;
	};

	if (typeof err === 'object' && err !== null) {
		const e = err as Record<string, unknown>;
		const cause = (e.cause as Record<string, unknown> | undefined) ?? undefined;
		const topCode = typeof e.code === 'number' ? (e.code as number) : undefined;
		const causeCode =
			typeof cause?.code === 'number' ? (cause.code as number) : undefined;
		const rejectionCode = causeCode ?? topCode;
		const topMsg = typeof e.message === 'string' ? (e.message as string) : '';
		if (rejectionCode === 4001 || /User rejected/i.test(topMsg)) {
			return { code: 'REJECTED', message: 'User rejected the request.' };
		}
	}

	if (err instanceof Error) {
		const rec = err as unknown as Record<string, unknown>;
		const shortMessage =
			typeof rec.shortMessage === 'string'
				? (rec.shortMessage as string)
				: undefined;
		const details =
			typeof rec.details === 'string' ? (rec.details as string) : undefined;
		setMsg(shortMessage);
		if (message === 'Transaction failed') setMsg(details);
		if (message === 'Transaction failed') setMsg(err.message);
	}

	let data: Hex | undefined;
	if (typeof err === 'object' && err !== null) {
		const e = err as Record<string, unknown>;
		const cause = e.cause as Record<string, unknown> | undefined;
		const topData = typeof e.data === 'string' ? (e.data as Hex) : undefined;
		const causeData =
			typeof cause?.data === 'string' ? (cause.data as Hex) : undefined;
		data = causeData ?? topData;
	}

	if (data && typeof data === 'string') {
		try {
			const decoded = (() => {
				try {
					return decodeErrorResult({ abi: tokenVestingAbi, data });
				} catch {
					return decodeErrorResult({ abi: stdErrorAbi, data });
				}
			})();

			if (decoded?.errorName === 'Error' && decoded?.args?.[0] !== undefined) {
				message = String(decoded.args[0]);
				code = 'REVERT';
			} else if (decoded?.errorName) {
				const args = (decoded.args ?? [])
					.map((x: unknown) => String(x))
					.join(', ');
				message = args ? `${decoded.errorName}(${args})` : decoded.errorName;
				code = 'REVERT';
			}
		} catch {
			/* ignore */
		}
	}

	if (/revert/i.test(message) || /execution reverted/i.test(message))
		code = 'REVERT';
	if (/rpc/i.test(message) || /nonce/i.test(message))
		code = code === 'UNKNOWN' ? 'RPC' : code;

	return { code, message: message || 'Transaction failed' };
}

export function useStakeToken() {
	const { address } = useAccount();

	// 🔒 pin client to Base
	const publicClient = usePublicClient({ chainId: BASE_CHAIN_ID });

	const activeChainId = useChainId();
	const { switchChainAsync } = useSwitchChain();

	const { writeContractAsync } = useWriteContract();

	const [isApproving, setIsApproving] = useState(false);
	const [isStaking, setIsStaking] = useState(false);
	const [approveHash, setApproveHash] = useState<`0x${string}`>();
	const [stakeHash, setStakeHash] = useState<`0x${string}`>();
	const [lastError, setLastError] = useState<string | null>(null);

	const ensureOnBase = useCallback(async () => {
		if (activeChainId === BASE_CHAIN_ID) return;
		await switchChainAsync({ chainId: BASE_CHAIN_ID });
	}, [activeChainId, switchChainAsync]);

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
		}: StakeParams): Promise<TxOutcome> => {
			setLastError(null);

			if (!address)
				return { ok: false, code: 'UNKNOWN', message: 'Wallet not connected' };
			if (!publicClient)
				return { ok: false, code: 'UNKNOWN', message: 'No public client' };

			const amountWei = parseUnits(amount || '0', decimals);
			if (amountWei <= 0n) {
				return {
					ok: false,
					code: 'UNKNOWN',
					message: 'Amount must be greater than 0',
				};
			}

			const cliffSec = BigInt(cliffDays) * DAY;

			try {
				// 🔁 make sure wallet is on Base before any tx
				await ensureOnBase();

				// 1) Allowance (read on Base)
				const allowance = (await publicClient.readContract({
					address: tokenX,
					abi: erc20Abi,
					functionName: 'allowance',
					args: [address, vestingAddress],
				})) as bigint;

				// 2) Approve if needed (simulate on Base -> write on Base)
				if (allowance < amountWei) {
					setIsApproving(true);
					try {
						const { request } = await publicClient.simulateContract({
							address: tokenX,
							abi: erc20Abi,
							functionName: 'approve',
							args: [vestingAddress, amountWei],
							account: address,
							chain: publicClient.chain, // Base
						});
						const txHash = await writeContractAsync(request);
						setApproveHash(txHash);
						await publicClient.waitForTransactionReceipt({ hash: txHash });
					} catch (e) {
						const { code, message } = decodeRevertMessage(e);
						setIsApproving(false);
						setLastError(message);
						return { ok: false, code, message };
					}
					setIsApproving(false);
				}

				// 3) Stake (simulate on Base -> write on Base)
				setIsStaking(true);
				try {
					const { request } = await publicClient.simulateContract({
						address: vestingAddress,
						abi: tokenVestingAbi,
						functionName: 'createVestingSchedule',
						args: [
							address,
							cliffSec,
							slicePeriodSeconds,
							durationSec,
							revocable,
							amountWei,
						],
						account: address,
						chain: publicClient.chain, // Base
					});
					const txHash2 = await writeContractAsync(request);
					setStakeHash(txHash2);
					await publicClient.waitForTransactionReceipt({ hash: txHash2 });
					setIsStaking(false);
					return { ok: true, approveHash, stakeHash: txHash2 };
				} catch (e) {
					const { code, message } = decodeRevertMessage(e);
					setIsStaking(false);
					setLastError(message);
					return { ok: false, code, message };
				}
			} catch (e) {
				const { code, message } = decodeRevertMessage(e);
				setIsApproving(false);
				setIsStaking(false);
				setLastError(message);
				return { ok: false, code, message };
			}
		},
		[address, publicClient, writeContractAsync, approveHash, ensureOnBase]
	);

	return {
		stake,
		isApproving,
		isStaking,
		isMining: isApproving || isStaking,
		approveHash,
		stakeHash,
		lastError,
	};
}
