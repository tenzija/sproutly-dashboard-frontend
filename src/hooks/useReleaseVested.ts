// hooks/useReleaseVested.ts
'use client';

import { useCallback, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { tokenVestingAbi } from '@/abis/minimalAbi';

export function useReleaseVested() {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const { writeContractAsync } = useWriteContract();

	const [isClaiming, setIsClaiming] = useState(false);
	const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

	const release = useCallback(
		async (vestingAddress: `0x${string}`, id: `0x${string}`) => {
			if (!address) throw new Error('Wallet not connected');
			if (!publicClient) throw new Error('No public client');
			setIsClaiming(true);
			try {
				// simulate first for gas & revert reasons
				const { request } = await publicClient.simulateContract({
					address: vestingAddress,
					abi: tokenVestingAbi,
					functionName: 'release',
					args: [id],
					account: address,
				});

				const hash = await writeContractAsync(request);
				setTxHash(hash);
				await publicClient.waitForTransactionReceipt({ hash });
			} finally {
				setIsClaiming(false);
			}
		},
		[address, publicClient, writeContractAsync]
	);

	return { release, isClaiming, txHash };
}
