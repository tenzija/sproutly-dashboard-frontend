// hooks/useStakeToken.ts
'use client';

import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
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

/** ✅ Dedicated error code union */
type TxErrorCode = 'REJECTED' | 'REVERT' | 'RPC' | 'UNKNOWN';

/** Discriminated result so UI can branch without try/catch */
export type TxOutcome =
	| { ok: true; approveHash?: `0x${string}`; stakeHash: `0x${string}` }
	| { ok: false; code: TxErrorCode; message: string };

type StakeParams = {
	vestingAddress: `0x${string}`;
	tokenX: `0x${string}`;
	amount: string; // human, e.g. "2500"
	durationSec: bigint; // lock in seconds
	cliffDays?: number; // optional extra cliff after lock
	slicePeriodSeconds?: bigint; // default: 1 day
	revocable?: boolean; // default: false
	decimals?: number; // default: 18
};

/** ✅ Properly typed minimal ABI for Error(string) */
const stdErrorAbi = [
	{
		type: 'error',
		name: 'Error',
		inputs: [{ name: 'message', type: 'string' }],
	},
] as const satisfies Abi;

/** ✅ Use TxErrorCode directly here (avoid TxOutcome['code']) */

function decodeRevertMessage(err: unknown): {
	code: TxErrorCode;
	message: string;
} {
	let message = 'Transaction failed';
	let code: TxErrorCode = 'UNKNOWN';

	const setMsg = (m?: string) => {
		if (m && typeof m === 'string') message = m;
	};

	// ---------- 1) EIP-1193 rejection
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

	// ---------- 2) viem/BaseError rich messages (shortMessage/details/message)
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

	// ---------- 3) Decode revert data (custom errors / Error(string))
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
			// ignore decode failure
		}
	}

	// ---------- 4) Heuristics
	if (/revert/i.test(message) || /execution reverted/i.test(message))
		code = 'REVERT';
	if (/rpc/i.test(message) || /nonce/i.test(message))
		code = code === 'UNKNOWN' ? 'RPC' : code;

	return { code, message: message || 'Transaction failed' };
}

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
		}: StakeParams): Promise<TxOutcome> => {
			setLastError(null);

			if (!address)
				return { ok: false, code: 'UNKNOWN', message: 'Wallet not connected' };
			if (!publicClient)
				return { ok: false, code: 'UNKNOWN', message: 'No public client' };

			const amountWei = parseUnits(amount || '0', decimals);
			if (amountWei <= 0n)
				return {
					ok: false,
					code: 'UNKNOWN',
					message: 'Amount must be greater than 0',
				};

			const cliffSec = BigInt(cliffDays) * DAY;

			try {
				// --- 1) Allowance
				const allowance = (await publicClient.readContract({
					address: tokenX,
					abi: erc20Abi,
					functionName: 'allowance',
					args: [address, vestingAddress],
				})) as bigint;

				// --- 2) Approve if needed (simulate + send)
				if (allowance < amountWei) {
					setIsApproving(true);
					try {
						const { request } = await publicClient.simulateContract({
							address: tokenX,
							abi: erc20Abi,
							functionName: 'approve',
							args: [vestingAddress, amountWei],
							account: address,
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

				// --- 3) Stake (simulate + send)
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
		[address, publicClient, writeContractAsync, approveHash]
	);

	return {
		stake,
		isApproving,
		isStaking,
		isMining: isApproving || isStaking,
		approveHash,
		stakeHash,
		lastError, // for UI toasts/snackbars
	};
}
