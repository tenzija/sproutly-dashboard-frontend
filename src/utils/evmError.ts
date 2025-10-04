// src/utils/evmError.ts

/** Common EIP-1193 / JSON-RPC error codes */
const E = {
	USER_REJECTED: 4001,
	UNAUTHORIZED: 4100,
	DISCONNECTED: 4900,
	CHAIN_DISCONNECTED: 4901,
	PARSE: -32700,
	INVALID_REQUEST: -32600,
	METHOD_NOT_FOUND: -32601,
	INVALID_PARAMS: -32602,
	INTERNAL: -32603,
	INSUFFICIENT_FUNDS: -32000, // often used by nodes for "insufficient funds for gas * price + value"
} as const;

/** gas token symbols by chain */
export function nativeSymbolFor(chainId?: number): string {
	switch (chainId) {
		case 1:
			return 'ETH'; // Ethereum
		case 8453:
			return 'ETH'; // Base
		case 10:
			return 'ETH'; // Optimism
		case 137:
			return 'MATIC'; // Polygon PoS
		case 42161:
			return 'ETH'; // Arbitrum
		case 56:
			return 'BNB'; // BNB Smart Chain
		case 43114:
			return 'AVAX'; // Avalanche C-Chain
		default:
			return 'ETH';
	}
}

export type FriendlyError = {
	code?: number | string;
	userMessage: string;
	devMessage?: string;
	hint?: 'retry' | 'switch-network' | 'check-balance' | 'open-wallet' | 'none';
};

export type EvmErrorOptions = {
	nativeSymbol?: string;
	/** map specific revert substrings/regex → nicer messages */
	contractHints?: Array<{ match: RegExp; message: string }>;
};

function extractMessage(err: unknown): { short?: string; full: string } {
	const e = err as
		| {
				shortMessage?: string;
				details?: string;
				reason?: string;
				message?: string;
				cause?: { message?: string; code?: number };
				error?: { message?: string; code?: number };
		  }
		| undefined;

	const parts = new Set<string>();
	if (e?.shortMessage) parts.add(e.shortMessage);
	if (e?.details) parts.add(e.details);
	if (e?.reason) parts.add(e.reason);
	if (e?.message) parts.add(e.message);
	if (e?.cause?.message) parts.add(e.cause.message);
	if (e?.error?.message) parts.add(e.error.message);

	const full =
		Array.from(parts).filter(Boolean).join(' | ') || String(err ?? '');
	return { short: e?.shortMessage, full };
}

function extractCode(err: unknown): number | undefined {
	const e = err as
		| { code?: number; cause?: { code?: number }; error?: { code?: number } }
		| undefined;
	return e?.code ?? e?.cause?.code ?? e?.error?.code ?? undefined;
}

function looksLikeInsufficientFunds(text: string) {
	return /insufficient funds|insufficient balance|funds for gas/i.test(text);
}
function looksLikeWrongChain(text: string) {
	return /chain mismatch|wrong network|different chain id|unsupported chain/i.test(
		text
	);
}
function looksLikeUserDenied(text: string, code?: number) {
	return (
		code === E.USER_REJECTED ||
		/user rejected|denied|request rejected/i.test(text)
	);
}

function matchContractHint(
	text: string,
	hints?: EvmErrorOptions['contractHints']
) {
	if (!hints) return;
	for (const h of hints) {
		if (h.match.test(text)) return h.message;
	}
}

/** Main entry: normalize any EVM/wallet error into a kid-friendly message */
export function toFriendlyEvmError(
	err: unknown,
	opts: EvmErrorOptions = {}
): FriendlyError {
	const { nativeSymbol = 'ETH', contractHints } = opts;
	const { full } = extractMessage(err);
	const code = extractCode(err);

	// 1) user denied in wallet
	if (looksLikeUserDenied(full, code)) {
		return {
			code: code ?? 'USER_DENIED',
			userMessage: 'You said “No” in your wallet. That’s okay!',
			devMessage: full,
			hint: 'open-wallet',
		};
	}

	// 2) wrong chain
	if (looksLikeWrongChain(full)) {
		return {
			code: code ?? 'CHAIN_MISMATCH',
			userMessage:
				'You are on the wrong network. Please switch the network and try again.',
			devMessage: full,
			hint: 'switch-network',
		};
	}

	// 3) not enough gas funds
	if (code === E.INSUFFICIENT_FUNDS || looksLikeInsufficientFunds(full)) {
		return {
			code: code ?? 'INSUFFICIENT_FUNDS',
			userMessage: `You need a little more ${nativeSymbol} for the network fee.`,
			devMessage: full,
			hint: 'check-balance',
		};
	}

	// 4) provider not connected
	if (code === E.DISCONNECTED || code === E.CHAIN_DISCONNECTED) {
		return {
			code,
			userMessage: 'Wallet is not connected. Please connect and try again.',
			devMessage: full,
			hint: 'open-wallet',
		};
	}

	// 5) known contract reverts → nicer lines
	const contractHint = matchContractHint(full, contractHints);
	if (contractHint) {
		return {
			code: code ?? 'CONTRACT_REVERT',
			userMessage: contractHint,
			devMessage: full,
			hint: 'none',
		};
	}

	// 6) generic reverty
	if (/execution reverted|reverted/i.test(full)) {
		return {
			code: code ?? 'EXECUTION_REVERTED',
			userMessage: 'This action is not allowed right now.',
			devMessage: full,
			hint: 'none',
		};
	}

	// 7) default
	return {
		code: code ?? 'UNKNOWN',
		userMessage: 'Something went wrong. Please try again.',
		devMessage: full,
		hint: 'retry',
	};
}
