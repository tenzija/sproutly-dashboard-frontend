// hooks/useBridge.ts
'use client';

import { erc20Abi, mockWormholeBridgeAbi } from '@/abis/minimalAbi';
import { useCallback, useRef, useState } from 'react';
import type { Address, Hex } from 'viem';
import { parseUnits, parseAbiItem, UserRejectedRequestError } from 'viem';
import {
	useAccount,
	useChainId,
	usePublicClient,
	useReadContract,
	useSwitchChain,
	useWriteContract,
} from 'wagmi';
import { base, polygon } from 'wagmi/chains';

type BridgeProgress =
	| 'idle'
	| 'approving'
	| 'approved'
	| 'quoting'
	| 'sending'
	| 'sent'
	| 'waitingBase'
	| 'done'
	| 'error';

type BridgeSuccess = {
	status: 'success';
	hash: Hex;
	completion: { type: 'Withdraw' | 'Withdrawn'; blockNumber: bigint };
	ms: number | null;
};
type BridgeUserRejected = { status: 'userRejected' };
type BridgeFailed = { status: 'failed'; message: string };
export type BridgeResult = BridgeSuccess | BridgeUserRejected | BridgeFailed;

const POLYGON_BRIDGE_ADDRESS = process.env
	.NEXT_PUBLIC_BRIDGE_POLY as `0x${string}`;
const BASE_BRIDGE_ADDRESS = process.env
	.NEXT_PUBLIC_BRIDGE_BASE as `0x${string}`;
const BASE_VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_BASE as `0x${string}`;
const POLYGON_TOKEN_ADDRESS = process.env
	.NEXT_PUBLIC_MOCK_TOKEN as `0x${string}`;

const EXTRA_GAS = BigInt(process.env.NEXT_PUBLIC_EXTRA_GAS ?? '0');
const TOKEN_DEC = Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS ?? '18');

// Event fragments for typed getLogs
const WithdrawEvent = parseAbiItem(
	'event Withdraw(address indexed to, uint256 amount)'
);
const WithdrawnEvent = parseAbiItem(
	'event Withdrawn(address indexed to, uint256 amount)'
);

// Distinct error we can detect in one place
class UserRejected extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'UserRejected';
	}
}
const isUserRejectedDeep = (err: unknown): boolean => {
	// viem wraps errors; check instance and common 4001 code & substrings
	if (err instanceof UserRejectedRequestError) return true;
	const anyErr = err as { code?: number; message?: string; cause?: unknown };
	if (anyErr?.code === 4001) return true;
	if (/denied transaction signature|user rejected/i.test(anyErr?.message ?? ''))
		return true;
	if (anyErr?.cause) return isUserRejectedDeep(anyErr.cause);
	return false;
};

export function useBridge() {
	const { address } = useAccount();

	const polygonClient = usePublicClient({ chainId: polygon.id });
	const baseClient = usePublicClient({ chainId: base.id });

	const { writeContractAsync } = useWriteContract();

	const [progress, setProgress] = useState<BridgeProgress>('idle');
	const [txHash, setTxHash] = useState<Hex | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [bridgingMs, setBridgingMs] = useState<number | null>(null);

	const startedAt = useRef<number | null>(null);

	// network switching
	const activeChainId = useChainId();
	const { switchChainAsync } = useSwitchChain();
	const isOnPolygon = activeChainId === polygon.id;
	const isReady = Boolean(polygonClient && baseClient);

	const reset = useCallback(() => {
		setProgress('idle');
		setTxHash(null);
		setError(null);
		setBridgingMs(null);
		startedAt.current = null;
	}, []);

	const ensureOnPolygon = useCallback(async (): Promise<void> => {
		if (isOnPolygon) return;
		try {
			await switchChainAsync({ chainId: polygon.id });
			if (typeof window !== 'undefined') {
				await new Promise<void>((r) => setTimeout(r, 200));
			}
		} catch (err) {
			if (isUserRejectedDeep(err))
				throw new UserRejected('Network switch rejected');
			throw err as Error;
		}
	}, [isOnPolygon, switchChainAsync]);

	const waitReceipt = useCallback(
		async (hash: Hex) => {
			if (!polygonClient) throw new Error('Polygon client not ready');
			return polygonClient.waitForTransactionReceipt({ hash });
		},
		[polygonClient]
	);

	// Reads
	const { data: crossChainId } = useReadContract({
		abi: mockWormholeBridgeAbi,
		address: POLYGON_BRIDGE_ADDRESS,
		functionName: 'crossChainId',
		chainId: polygon.id,
	});

	const { data: minGasLimit } = useReadContract({
		abi: mockWormholeBridgeAbi,
		address: POLYGON_BRIDGE_ADDRESS,
		functionName: 'MIN_GAS_LIMIT',
		chainId: polygon.id,
	});

	// Helpers
	const approveIfNeeded = useCallback(
		async (owner: Address, amount: bigint): Promise<void> => {
			if (!polygonClient) throw new Error('Polygon client not ready');

			const allowance = (await polygonClient.readContract({
				abi: erc20Abi,
				address: POLYGON_TOKEN_ADDRESS,
				functionName: 'allowance',
				args: [owner, POLYGON_BRIDGE_ADDRESS],
			})) as bigint;

			if (allowance >= amount) return;

			setProgress('approving');

			const sim = await polygonClient.simulateContract({
				abi: erc20Abi,
				address: POLYGON_TOKEN_ADDRESS,
				functionName: 'approve',
				args: [POLYGON_BRIDGE_ADDRESS, amount],
				account: owner,
			});

			try {
				const hash = await writeContractAsync(sim.request);
				await waitReceipt(hash);
			} catch (err) {
				if (isUserRejectedDeep(err)) throw new UserRejected('Approve rejected');
				throw err as Error;
			}

			setProgress('approved');
		},
		[polygonClient, writeContractAsync, waitReceipt]
	);

	const quoteCost = useCallback(
		async (extraGas: bigint): Promise<bigint> => {
			if (!polygonClient) throw new Error('Polygon client not ready');
			setProgress('quoting');

			const cost = (await polygonClient.readContract({
				abi: mockWormholeBridgeAbi,
				address: POLYGON_BRIDGE_ADDRESS,
				functionName: 'quoteCrossChainCall',
				args: [Number(crossChainId ?? 0), extraGas],
			})) as bigint;

			return cost;
		},
		[polygonClient, crossChainId]
	);

	const sendDeposit = useCallback(
		async (
			from: Address,
			to: Address,
			amount: bigint,
			extraGas: bigint,
			value: bigint
		): Promise<Hex> => {
			if (!polygonClient) throw new Error('Polygon client not ready');
			setProgress('sending');

			const sim = await polygonClient.simulateContract({
				abi: mockWormholeBridgeAbi,
				address: POLYGON_BRIDGE_ADDRESS,
				functionName: 'sendCrossChainDeposit',
				args: [to, amount, extraGas],
				value,
				account: from,
			});

			console.log('sim', sim);

			let hash: Hex;
			try {
				hash = await writeContractAsync(sim.request);
			} catch (err) {
				if (isUserRejectedDeep(err))
					throw new UserRejected('Bridge transaction rejected');
				throw err as Error;
			}

			setTxHash(hash);
			await waitReceipt(hash);
			setProgress('sent');
			return hash;
		},
		[polygonClient, writeContractAsync, waitReceipt]
	);

	const waitBaseCompletion = useCallback(
		async (
			to: Address,
			fromBlock?: bigint,
			timeoutMs = 600_000
		): Promise<{ type: 'Withdraw' | 'Withdrawn'; blockNumber: bigint }> => {
			if (!baseClient) throw new Error('Base client not ready');
			setProgress('waitingBase');

			const startBlock = fromBlock ?? (await baseClient.getBlockNumber());
			const deadline = Date.now() + timeoutMs;

			while (Date.now() < deadline) {
				const logsBridge = await baseClient.getLogs({
					address: BASE_BRIDGE_ADDRESS,
					fromBlock: startBlock,
					toBlock: 'latest',
					event: WithdrawEvent,
					args: { to },
				});
				if (logsBridge.length > 0) {
					return { type: 'Withdraw', blockNumber: logsBridge[0].blockNumber };
				}

				const logsVault = await baseClient.getLogs({
					address: BASE_VAULT_ADDRESS,
					fromBlock: startBlock,
					toBlock: 'latest',
					event: WithdrawnEvent,
					args: { to },
				});
				if (logsVault.length > 0) {
					return { type: 'Withdrawn', blockNumber: logsVault[0].blockNumber };
				}

				// eslint-disable-next-line no-promise-executor-return
				await new Promise<void>((r) => setTimeout(r, 3000));
			}

			throw new Error('Timeout waiting for Base completion');
		},
		[baseClient]
	);

	// Public action
	const bridge = useCallback(
		async (humanAmount: string, receiver?: Address): Promise<BridgeResult> => {
			setError(null);
			setBridgingMs(null);
			setProgress('idle');

			if (!address) return { status: 'failed', message: 'Connect wallet' };
			if (!isReady)
				return { status: 'failed', message: 'RPC clients not ready' };

			try {
				// Make sure wallet is on Polygon for upcoming writes
				await ensureOnPolygon();
			} catch (err) {
				if (err instanceof UserRejected) {
					reset();
					return { status: 'userRejected' };
				}
				setProgress('error');
				setError((err as Error).message);
				return { status: 'failed', message: (err as Error).message };
			}

			const to: Address = (receiver ?? address) as Address;
			const amount = parseUnits(humanAmount, TOKEN_DEC);

			// Balance check
			const bal = (await polygonClient!.readContract({
				abi: erc20Abi,
				address: POLYGON_TOKEN_ADDRESS,
				functionName: 'balanceOf',
				args: [address],
			})) as bigint;
			if (bal < amount)
				return { status: 'failed', message: 'Insufficient token balance' };

			// Approve (may be no-op)
			try {
				await approveIfNeeded(address as Address, amount);
			} catch (err) {
				if (err instanceof UserRejected) {
					reset();
					return { status: 'userRejected' };
				}
				setProgress('error');
				setError((err as Error).message);
				return { status: 'failed', message: (err as Error).message };
			}

			// Quote
			const value = await quoteCost(EXTRA_GAS);

			// Start timer at Polygon confirmation boundary
			startedAt.current = Date.now();

			// Send deposit
			let hash: Hex;
			try {
				hash = await sendDeposit(
					address as Address,
					to,
					amount,
					EXTRA_GAS,
					value
				);
			} catch (err) {
				if (err instanceof UserRejected) {
					reset();
					return { status: 'userRejected' };
				}
				setProgress('error');
				setError((err as Error).message);
				return { status: 'failed', message: (err as Error).message };
			}

			const baseFrom = await baseClient!.getBlockNumber();
			const completion = await waitBaseCompletion(to, baseFrom);

			const elapsed =
				startedAt.current != null ? Date.now() - startedAt.current : null;
			setBridgingMs(elapsed);
			setProgress('done');

			return { status: 'success', hash, completion, ms: elapsed };
		},
		[
			address,
			isReady,
			ensureOnPolygon,
			polygonClient,
			baseClient,
			approveIfNeeded,
			quoteCost,
			sendDeposit,
			waitBaseCompletion,
			reset,
		]
	);

	return {
		progress,
		error,
		txHash,
		bridgingMs,
		crossChainId, // uint16 | undefined
		minGasLimit, // bigint | undefined
		bridge, // returns BridgeResult
		isOnPolygon,
		isReady,
		reset,
	};
}
