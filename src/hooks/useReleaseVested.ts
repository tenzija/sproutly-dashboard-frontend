// hooks/useReleaseVested.ts
'use client';

import { useCallback, useState } from 'react';
import {
	useAccount,
	useChainId,
	usePublicClient,
	useSwitchChain,
	useWriteContract,
} from 'wagmi';
import { Address, Hex, UserRejectedRequestError } from 'viem';
import { tokenVestingAbi } from '@/abis/minimalAbi';
import { VESTING_HINTS } from '@/constant/errorHints';
import { useEvmError } from './useEvmError';
import { base } from 'wagmi/chains';
import { useActiveLocks } from './useActiveLocks';

const VESTING_ADDR = process.env.NEXT_PUBLIC_TOKEN_VESTING_ADDRESS;

const isHex32 = (x: unknown): x is Hex =>
	typeof x === 'string' && /^0x[0-9a-fA-F]{64}$/.test(x);

class UserRejected extends Error {
	constructor(m: string) {
		super(m);
		this.name = 'UserRejected';
	}
}
const isUserRejectedDeep = (err: unknown): boolean => {
	if (err instanceof UserRejectedRequestError) return true;
	const any = err as { code?: number; message?: string; cause?: unknown };
	if (any?.code === 4001) return true;
	if (/denied transaction signature|user rejected/i.test(any?.message ?? ''))
		return true;
	if (any?.cause) return isUserRejectedDeep(any.cause);
	return false;
};

export function useReleaseVested() {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const { writeContractAsync } = useWriteContract();
	const { switchChainAsync } = useSwitchChain();
	const { refetch: refetchActiveLocks } = useActiveLocks({
		vestingAddress: VESTING_ADDR as `0x${string}`,
	});

	const [isClaiming, setIsClaiming] = useState(false);
	const [txHash, setTxHash] = useState<Hex | undefined>();
	const activeChainId = useChainId();

	const { handleTx } = useEvmError({ contractHints: VESTING_HINTS });
	// === Only check / switch network inside bridge ===
	const ensureOnBase = useCallback(async (): Promise<void> => {
		if (activeChainId === base.id) return;
		try {
			await switchChainAsync({ chainId: base.id });
			if (typeof window !== 'undefined')
				await new Promise<void>((r) => setTimeout(r, 200));
		} catch (err) {
			if (isUserRejectedDeep(err))
				throw new UserRejected('Network switch rejected');
			throw err as Error;
		}
	}, [activeChainId, switchChainAsync]);

	const release = useCallback(
		async (vestingAddress: Address, id: Hex) => {
			if (!address) throw new Error('Wallet not connected');
			if (!publicClient) throw new Error('No public client');
			if (!isHex32(id)) throw new Error('Invalid schedule id');

			setIsClaiming(true);

			try {
				await ensureOnBase();
				return await handleTx(async () => {
					const { request } = await publicClient.simulateContract({
						address: vestingAddress,
						abi: tokenVestingAbi,
						functionName: 'release',
						args: [id],
						account: address,
					});

					const hash = await writeContractAsync(request);
					setTxHash(hash);
					const receipt = await publicClient.waitForTransactionReceipt({
						hash,
					});
					refetchActiveLocks();
					return receipt; // result passed to onSuccess if you provide it
				});
			} finally {
				setIsClaiming(false);
			}
		},
		[
			address,
			publicClient,
			writeContractAsync,
			handleTx,
			ensureOnBase,
			refetchActiveLocks,
		]
	);

	return { release, isClaiming, txHash };
}
