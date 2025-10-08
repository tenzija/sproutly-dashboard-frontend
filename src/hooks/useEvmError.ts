// src/hooks/useEvmError.ts
'use client';

import { useCallback, useMemo } from 'react';
import { useChainId } from 'wagmi';
import {
	nativeSymbolFor,
	toFriendlyEvmError,
	type EvmErrorOptions,
	type FriendlyError,
} from '@/utils/evmError';

/**
 * React-friendly helper.
 * - Auto-detects chainId to pick the right native gas symbol.
 * - Lets you pass default contract hints once.
 * - Provides `handleTx` wrapper to normalize errors for any async action.
 */
export function useEvmError(
	defaultOpts?: Omit<EvmErrorOptions, 'nativeSymbol'>
) {
	const chainId = useChainId();
	const opts: EvmErrorOptions = useMemo(
		() => ({ nativeSymbol: nativeSymbolFor(chainId), ...defaultOpts }),
		[chainId, defaultOpts]
	);

	const asFriendly = useCallback(
		(err: unknown): FriendlyError => toFriendlyEvmError(err, opts),
		[opts]
	);

	/**
	 * Wrap ANY async transaction flow:
	 *   await handleTx(async () => { ...simulate; ...write; ...wait; }, { onSuccess, onError })
	 */
	const handleTx = useCallback(
		async <T>(
			fn: () => Promise<T>,
			cb?: {
				onSuccess?: (result: T) => void;
				onError?: (fr: FriendlyError) => void;
			}
		) => {
			try {
				const res = await fn();
				cb?.onSuccess?.(res);
				return res;
			} catch (err) {
				const fr = asFriendly(err);
				cb?.onError?.(fr);
				throw fr; // rethrow so callers can `toast.error(fr.userMessage)`
			}
		},
		[asFriendly]
	);

	return { toFriendlyEvmError: asFriendly, handleTx };
}
