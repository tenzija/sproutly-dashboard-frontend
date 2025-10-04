'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, polygon } from '@reown/appkit/networks';
import { defineChain } from 'viem';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) console.error('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');

const sproutlyTestnet = defineChain({
	id: 1313161798,
	name: 'Sproutly Testnet',
	network: 'sproutly-testnet',
	nativeCurrency: { name: 'vMock Token', symbol: 'vMock', decimals: 18 },
	rpcUrls: {
		default: { http: ['https://0x4e454246.rpc.aurora-cloud.dev'] },
		public: { http: ['https://0x4e454246.rpc.aurora-cloud.dev'] },
	},
	blockExplorers: {
		default: {
			name: 'Sproutly Explorer',
			url: 'https://explorer.sproutly-testnet.io',
		},
	},
	testnet: true,
});

// Build a single Wagmi adapter (client-only)
export const wagmiAdapter = new WagmiAdapter({
	// You can pass viem chains here; AppKit networks can mix with viem chains.
	networks: [sproutlyTestnet],
	projectId,
	ssr: true,
});

// Singleton guard to avoid repeated createAppKit() calls in dev/HMR
declare global {
	var __APPKIT_SINGLETON__: ReturnType<typeof createAppKit> | undefined;
}

export const appKit =
	globalThis.__APPKIT_SINGLETON__ ||
	(globalThis.__APPKIT_SINGLETON__ = createAppKit({
		adapters: [wagmiAdapter],
		projectId,
		// AppKit networks may include @reown/appkit/networks presets + custom viem chain
		networks: [base, polygon, sproutlyTestnet as any],
		defaultNetwork: base,
		metadata: {
			name: 'Sproutly',
			description: 'Sproutly dapp',
			url: 'https://sproutly.example',
			icons: ['https://avatars.githubusercontent.com/u/179229932'],
		},
		features: { analytics: false, socials: false, email: false },
		allWallets: 'HIDE',
		enableCoinbase: false,
	}));

// Export the Wagmi config for providers
export const wagmiConfig = wagmiAdapter.wagmiConfig;
