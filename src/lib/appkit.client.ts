'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, polygon } from '@reown/appkit/networks';
import { defineChain, Chain } from 'viem';

// Ensure projectId is defined
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;
if (!projectId) throw new Error('Missing NEXT_PUBLIC_PROJECT_ID');

// Define Sproutly Testnet chain with proper types
const sproutlyTestnet: Chain = defineChain({
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

// Declare global variable to ensure singleton initialization of AppKit
declare global {
	var __APPKIT_SINGLETON__: ReturnType<typeof createAppKit> | undefined;
}

// Create AppKit instance (singleton pattern)
export const appKit =
	globalThis.__APPKIT_SINGLETON__ ||
	(globalThis.__APPKIT_SINGLETON__ = createAppKit({
		adapters: [
			new WagmiAdapter({
				networks: [sproutlyTestnet, base, polygon],
				projectId,
				ssr: true,
			}),
		],
		projectId,
		networks: [base, polygon, sproutlyTestnet],
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

// Define and export wagmiConfig with appropriate types
export const wagmiConfig = new WagmiAdapter({
	networks: [sproutlyTestnet, base, polygon],
	projectId,
	ssr: true,
}).wagmiConfig;
