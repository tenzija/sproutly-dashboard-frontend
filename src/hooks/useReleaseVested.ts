// hooks/useReleaseVested.ts
'use client';

import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import type { Address, Hex } from 'viem';
import { tokenVestingAbi } from '@/abis/minimalAbi';
import { VESTING_HINTS } from '@/constant/errorHints';
import { useEvmError } from './useEvmError';

const isHex32 = (x: unknown): x is Hex =>
	typeof x === 'string' && /^0x[0-9a-fA-F]{64}$/.test(x);

export function useReleaseVested() {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const { writeContractAsync } = useWriteContract();

	const [isClaiming, setIsClaiming] = useState(false);
	const [txHash, setTxHash] = useState<Hex | undefined>();

	const { handleTx } = useEvmError({ contractHints: VESTING_HINTS });

	const release = useCallback(
		async (vestingAddress: Address, id: Hex) => {
			if (!address) throw new Error('Wallet not connected');
			if (!publicClient) throw new Error('No public client');
			if (!isHex32(id)) throw new Error('Invalid schedule id');

			setIsClaiming(true);
			try {
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
					return receipt; // result passed to onSuccess if you provide it
				});
			} finally {
				setIsClaiming(false);
			}
		},
		[address, publicClient, writeContractAsync]
	);

	return { release, isClaiming, txHash };
}
