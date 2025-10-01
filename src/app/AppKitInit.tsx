// src/app/AppKitInit.tsx
'use client';

import { useRef } from 'react';
import { createAppKit } from '@reown/appkit/react';
import { base, polygon } from '@reown/appkit/networks';
import { defineChain } from 'viem';
import { wagmiAdapter, projectId } from "@/config";

declare global {
    interface Window {
        __APPKIT_INIT__?: boolean;
    }
}

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
        default: { name: 'Sproutly Explorer', url: 'https://explorer.sproutly-testnet.io' },
    },
    testnet: true,
});

const metadata = {
    name: 'Sproutly',
    description: 'Sproutly dapp',
    url: 'https://sproutly.example', // set your real URL
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

export default function AppKitInit() {
    // Ensure we run only once per page load
    const ran = useRef(false);
    if (!ran.current) {
        if (!projectId) throw new Error('Project ID is not defined');

        if (typeof window !== 'undefined' && !window.__APPKIT_INIT__) {
            window.__APPKIT_INIT__ = true;
            createAppKit({
                adapters: [wagmiAdapter],
                projectId,
                networks: [base, sproutlyTestnet, polygon],
                defaultNetwork: base,
                metadata,
                features: { analytics: false, socials: false, email: false },
                allWallets: 'HIDE',
                enableCoinbase: false,
            });
        }

        ran.current = true;
    }
    return null;
}
