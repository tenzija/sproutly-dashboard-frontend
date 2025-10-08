// hooks/useAutoDisconnectOnLock.ts
'use client';

import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import type { EIP1193Provider } from 'viem';

type MetaMaskProvider = EIP1193Provider & {
	_metamask?: { isUnlocked?: () => Promise<boolean> };
};

export function useAutoDisconnectOnLock(pollMs = 2000) {
	const { isConnected } = useAccount();
	const { disconnect } = useDisconnect();

	useEffect(() => {
		const eth = (window as Window & { ethereum?: MetaMaskProvider }).ethereum;
		if (!eth) return;

		let stopped = false;

		const check = async () => {
			if (stopped) return;

			// Prefer MM's isUnlocked when available
			try {
				if (eth._metamask?.isUnlocked) {
					const unlocked = await eth._metamask.isUnlocked();
					if (!unlocked && isConnected) {
						disconnect();
						return;
					}
				}
			} catch {
				// ignore; fall through to eth_accounts
			}

			try {
				const accounts = (await eth.request({
					method: 'eth_accounts',
				})) as string[];
				if (accounts.length === 0 && isConnected) {
					disconnect();
				}
			} catch {
				// ignore provider hiccups
			}
		};

		// Initial check + poll
		check();
		const timer = setInterval(check, pollMs);

		// Also re-check when tab gains focus or visibility changes
		const onFocus = () => check();
		const onVis = () => document.visibilityState === 'visible' && check();
		window.addEventListener('focus', onFocus);
		document.addEventListener('visibilitychange', onVis);

		// Optional: still listen to accountsChanged (helps on unlock)
		const onAccountsChanged = (accs: unknown) => {
			const a = Array.isArray(accs) ? (accs as string[]) : [];
			if (a.length === 0 && isConnected) disconnect();
		};
		eth.on?.('accountsChanged', onAccountsChanged);

		return () => {
			stopped = true;
			if (timer) clearInterval(timer);
			window.removeEventListener('focus', onFocus);
			document.removeEventListener('visibilitychange', onVis);
			eth.removeListener?.('accountsChanged', onAccountsChanged);
		};
	}, [isConnected, disconnect, pollMs]);
}
