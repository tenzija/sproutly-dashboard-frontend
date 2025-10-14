// src/lib/appkit.client.ts

'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { AppKitNetwork, base, polygon } from '@reown/appkit/networks';
import { defineChain, Chain } from 'viem';

// Ensure projectId is defined
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;
if (!projectId) throw new Error('Missing NEXT_PUBLIC_PROJECT_ID');

// Sproutly Testnet (unchanged)
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

// ✅ NEW: VeChain mainnet
const vechain: Chain = defineChain({
	id: 100009,
	name: 'VeChain',
	network: 'vechain',
	nativeCurrency: { name: 'VeChain', symbol: 'VET', decimals: 18 },
	rpcUrls: {
		default: { http: ['https://rpc-mainnet.vechain.energy'] },
		public: { http: ['https://rpc-mainnet.vechain.energy'] },
		// optional alternates: 'https://100009.rpc.thirdweb.com'
	},
	blockExplorers: {
		default: { name: 'VeChain Explorer', url: 'https://explore.vechain.org' },
	},
});

// ✅ NEW: VeChain testnet
const vechainTestnet: Chain = defineChain({
	id: 100010,
	name: 'VeChain Testnet',
	network: 'vechain-testnet',
	nativeCurrency: { name: 'VeChain', symbol: 'VET', decimals: 18 },
	rpcUrls: {
		default: { http: ['https://rpc-testnet.vechain.energy'] },
		public: { http: ['https://rpc-testnet.vechain.energy'] },
		// optional alternates: 'https://100010.rpc.thirdweb.com'
	},
	blockExplorers: {
		default: {
			name: 'VeChain Testnet Explorer',
			url: 'https://explore-testnet.vechain.org',
		},
	},
	testnet: true,
});

// Declare global variable to ensure singleton initialization of AppKit
declare global {
	var __APPKIT_SINGLETON__: ReturnType<typeof createAppKit> | undefined;
}
// Set up networks array
export const networks = [
	sproutlyTestnet,
	vechain,
	vechainTestnet,
	base,
	polygon,
] as [AppKitNetwork, ...AppKitNetwork[]];

// Set up the Wagmi Adapter (do not create it inside createAppKit)
export const wagmiAdapter = new WagmiAdapter({
	networks,
	projectId,
	ssr: true,
});

// Create AppKit instance (singleton pattern)
export const appKit =
	globalThis.__APPKIT_SINGLETON__ ||
	(globalThis.__APPKIT_SINGLETON__ = createAppKit({
		adapters: [wagmiAdapter],
		projectId,
		// 🔁 include VeChain networks (again, for AppKit UI)
		networks: networks,
		defaultNetwork: base,
		metadata: {
			name: 'Sproutly',
			description: 'Sproutly dapp',
			url: 'https://sproutly-dashboard-frontend.vercel.app/',
			icons: ['https://pbs.twimg.com/profile_images/1940421108127174656/dimIc4YC_400x400.jpg'],
		},
		features: { analytics: false, socials: false, email: false },
		allWallets: 'SHOW', // This enables support for all wallets, including Coinbase and others
	}));

// wagmiConfig export
export const wagmiConfig = wagmiAdapter.wagmiConfig;
