// hooks/useBridge.ts
'use client';

import { erc20Abi, mockWormholeBridgeAbi } from '@/abis/minimalAbi';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
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
type BridgeWrongNetwork = { status: 'wrongNetwork'; currentChainId?: number };
type BridgeFailed = { status: 'failed'; message: string };
export type BridgeResult =
	| BridgeSuccess
	| BridgeUserRejected
	| BridgeWrongNetwork
	| BridgeFailed;

const POLYGON_BRIDGE_ADDRESS = process.env
	.NEXT_PUBLIC_BRIDGE_POLY as `0x${string}`;
const BASE_BRIDGE_ADDRESS = process.env
	.NEXT_PUBLIC_BRIDGE_BASE as `0x${string}`;
const BASE_VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_BASE as `0x${string}`;
const POLYGON_TOKEN_ADDRESS = process.env
	.NEXT_PUBLIC_MOCK_TOKEN as `0x${string}`;

const EXTRA_GAS = BigInt(process.env.NEXT_PUBLIC_EXTRA_GAS ?? '0');
const TOKEN_DEC = Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS ?? '18');

const WithdrawEvent = parseAbiItem(
	'event Withdraw(address indexed to, uint256 amount)'
);
const WithdrawnEvent = parseAbiItem(
	'event Withdrawn(address indexed to, uint256 amount)'
);

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

export function useBridge() {
	const { address } = useAccount();

	// Public clients are chain-scoped and do NOT force wallet switching
	const polygonClient = usePublicClient({ chainId: polygon.id });
	const baseClient = usePublicClient({ chainId: base.id });

	const { writeContractAsync } = useWriteContract();
	const activeChainId = useChainId();
	const { switchChainAsync } = useSwitchChain();

	const isReady = Boolean(polygonClient && baseClient);

	const [progress, setProgress] = useState<BridgeProgress>('idle');
	const [txHash, setTxHash] = useState<Hex | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [bridgingMs, setBridgingMs] = useState<number | null>(null);
	const startedAt = useRef<number | null>(null);

	const reset = useCallback(() => {
		setProgress('idle');
		setTxHash(null);
		setError(null);
		setBridgingMs(null);
		startedAt.current = null;
	}, []);

	// Function to check the balance of ERC20 token and POL (Polygon native token)
	const checkBalances = useCallback(
		async (erc20Amount: bigint, polAmount: bigint): Promise<boolean> => {
			if (!polygonClient) throw new Error('Polygon client not ready');

			// Check the ERC20 token balance (mock token in this case)
			const erc20Balance = await polygonClient.readContract({
				abi: erc20Abi,
				address: POLYGON_TOKEN_ADDRESS,
				functionName: 'balanceOf',
				args: [address as Address],
			});

			// Check the Polygon (MATIC) balance
			const maticBalance = await polygonClient.getBalance({
				address: address as Address,
			});

			// Check if the balances are sufficient
			if (erc20Balance < erc20Amount) {
				toast.error('Insufficient token balance for the transaction.');
				return false;
			}

			if (maticBalance < polAmount) {
				toast.error('Insufficient POL balance for gas fees.');
				return false;
			}

			return true; // Balances are sufficient
		},
		[polygonClient, address]
	);

	// Read-only calls (don’t require wallet to be on Polygon)
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

	// --- Helpers that assume wallet is already on Polygon for writes ---
	const waitReceipt = useCallback(
		async (hash: Hex) => {
			if (!polygonClient) throw new Error('Polygon client not ready');
			return polygonClient.waitForTransactionReceipt({ hash });
		},
		[polygonClient]
	);

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

			try {
				const hash = await writeContractAsync(sim.request);
				setTxHash(hash);
				await waitReceipt(hash);
				setProgress('sent');
				return hash;
			} catch (err) {
				if (isUserRejectedDeep(err))
					throw new UserRejected('Bridge transaction rejected');
				throw err as Error;
			}
		},
		[polygonClient, writeContractAsync, waitReceipt]
	);

	const waitBaseCompletion = useCallback(
		async (to: Address, fromBlock?: bigint, timeoutMs = 600_000) => {
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
					return {
						type: 'Withdraw' as const,
						blockNumber: logsBridge[0].blockNumber,
					};
				}

				const logsVault = await baseClient.getLogs({
					address: BASE_VAULT_ADDRESS,
					fromBlock: startBlock,
					toBlock: 'latest',
					event: WithdrawnEvent,
					args: { to },
				});
				if (logsVault.length > 0) {
					return {
						type: 'Withdrawn' as const,
						blockNumber: logsVault[0].blockNumber,
					};
				}

				await new Promise<void>((r) => setTimeout(r, 3000));
			}

			throw new Error('Timeout waiting for Base completion');
		},
		[baseClient]
	);

	// === Only check / switch network inside bridge ===
	const ensureOnPolygon = useCallback(async (): Promise<void> => {
		if (activeChainId === polygon.id) return;
		try {
			await switchChainAsync({ chainId: polygon.id });
			if (typeof window !== 'undefined')
				await new Promise<void>((r) => setTimeout(r, 200));
		} catch (err) {
			if (isUserRejectedDeep(err))
				throw new UserRejected('Network switch rejected');
			throw err as Error;
		}
	}, [activeChainId, switchChainAsync]);

	/**
	 * Bridge tokens.
	 * @param humanAmount input amount as string
	 * @param receiver optional receiver
	 * @param opts.autoSwitch default true — if false, returns { status: 'wrongNetwork' } when not on Polygon.
	 */
	const bridge = useCallback(
		async (
			humanAmount: string,
			receiver?: Address,
			opts: { autoSwitch?: boolean } = { autoSwitch: true }
		): Promise<BridgeResult> => {
			setError(null);
			setBridgingMs(null);
			setProgress('idle');

			if (!address) return { status: 'failed', message: 'Connect wallet' };
			if (!isReady)
				return { status: 'failed', message: 'RPC clients not ready' };

			const amount = parseUnits(humanAmount, TOKEN_DEC);

			// Ensure chain first (before any reads/writes tied to chain)
			if (activeChainId !== polygon.id) {
				if (opts.autoSwitch === false) {
					return { status: 'wrongNetwork', currentChainId: activeChainId };
				}
				try {
					await ensureOnPolygon();
				} catch (err) {
					if (err instanceof UserRejected) {
						reset();
						return { status: 'userRejected' };
					}
					const msg = (err as Error).message;
					setProgress('error');
					setError(msg);
					return { status: 'failed', message: msg };
				}
			}

			const to: Address = (receiver ?? address) as Address;

			// --- 1) Token balance check BEFORE approval/quote ---
			const tokenBal = (await polygonClient!.readContract({
				abi: erc20Abi,
				address: POLYGON_TOKEN_ADDRESS,
				functionName: 'balanceOf',
				args: [address],
			})) as bigint;
			if (tokenBal < amount) {
				return { status: 'failed', message: 'Insufficient token balance' };
			}

			// --- 2) Approve (if needed) ---
			try {
				setProgress('approving');
				await approveIfNeeded(address as Address, amount);
				// optional: explicitly show the “approved” state
				setProgress('approved');
			} catch (err) {
				if (err instanceof UserRejected) {
					reset();
					return { status: 'userRejected' };
				}
				const msg = (err as Error).message;
				setProgress('error');
				setError(msg);
				return { status: 'failed', message: msg };
			}

			// --- 3) Quote AFTER approval so UI order is correct ---
			setProgress('quoting');
			let value: bigint;
			try {
				value = await quoteCost(EXTRA_GAS);
			} catch (err) {
				const msg = (err as Error).message;
				setProgress('error');
				setError(msg);
				return { status: 'failed', message: msg };
			}

			// Optional: check native balance for gas now that we know `value`
			const hasEnough = await checkBalances(amount, value);
			if (!hasEnough) {
				return { status: 'failed', message: 'Insufficient balance' };
			}

			// --- 4) Send deposit ---
			startedAt.current = Date.now();
			let hash: Hex;
			try {
				setProgress('sending');
				hash = await sendDeposit(
					address as Address,
					to,
					amount,
					EXTRA_GAS,
					value
				);
				setProgress('sent');
			} catch (err) {
				if (err instanceof UserRejected) {
					reset();
					return { status: 'userRejected' };
				}
				const msg = (err as Error).message;
				setProgress('error');
				setError(msg);
				return { status: 'failed', message: msg };
			}

			// --- 5) Wait on Base ---
			try {
				setProgress('waitingBase');
				const baseFrom = await baseClient!.getBlockNumber();
				const completion = await waitBaseCompletion(to, baseFrom);

				const elapsed =
					startedAt.current != null ? Date.now() - startedAt.current : null;
				setBridgingMs(elapsed);
				setProgress('done');

				return { status: 'success', hash, completion, ms: elapsed };
			} catch (err) {
				const msg = (err as Error).message;
				setProgress('error');
				setError(msg);
				return { status: 'failed', message: msg };
			}
		},
		[
			address,
			isReady,
			activeChainId,
			ensureOnPolygon,
			polygonClient,
			baseClient,
			approveIfNeeded,
			quoteCost,
			sendDeposit,
			waitBaseCompletion,
			reset,
			checkBalances,
		]
	);

	return {
		progress,
		error,
		txHash,
		bridgingMs,
		crossChainId,
		minGasLimit,
		bridge, // <-- only here do we check/switch
		isOnPolygon: activeChainId === polygon.id,
		isReady,
		reset,
	};
}
