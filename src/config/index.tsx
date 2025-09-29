import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base } from '@reown/appkit/networks';
import { http } from 'wagmi';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { defineChain } from "viem";

// WalletConnect Project Id
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) throw new Error('Project ID is not defined');

const sproutlyTestnet = defineChain({
  id: 1313161798,
  name: "Sproutly Testnet",
  network: "sproutly-testnet",
  nativeCurrency: { name: "vMock Token", symbol: "vMock", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://0x4e454246.rpc.aurora-cloud.dev"] },
    public: { http: ["https://0x4e454246.rpc.aurora-cloud.dev"] }
  },
  blockExplorers: {
    default: { name: "Sproutly Explorer", url: "https://explorer.sproutly-testnet.io" }
  },
  testnet: true
});

// (pick your chains)
export const networks = [base, sproutlyTestnet];

// ✅ Only two connectors: MetaMask (injected) + WalletConnect
// - `target: 'metaMask'` ensures the injected tile specifically says “MetaMask”
const connectors = [
  walletConnect({ projectId, showQrModal: false }) // AppKit shows the QR itself
];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
  transports: {
    [base.id]: http(), // set your RPC here if you want
  },
  connectors,
});

export const config = wagmiAdapter.wagmiConfig;
