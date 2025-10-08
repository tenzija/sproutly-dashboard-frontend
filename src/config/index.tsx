import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { base, polygon } from '@reown/appkit/networks';
import { http } from 'wagmi';
import { walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

// WalletConnect Project Id
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (!projectId) throw new Error('Project ID is not defined');

const sproutlyTestnet = defineChain({
  id: 1313161798,
  name: 'Sproutly Testnet',
  network: 'sproutly-testnet',
  nativeCurrency: { name: 'vMock Token', symbol: 'vMock', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://0x4e454246.rpc.aurora-cloud.dev'] },
    public: { http: ['https://0x4e454246.rpc.aurora-cloud.dev'] }
  },
  blockExplorers: {
    default: { name: 'Sproutly Explorer', url: 'https://explorer.sproutly-testnet.io' }
  },
  testnet: true
});

/** ✅ NEW: VeChain mainnet */
const vechain = defineChain({
  id: 100009,
  name: 'VeChain',
  network: 'vechain',
  nativeCurrency: { name: 'VeChain', symbol: 'VET', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-mainnet.vechain.energy'] },
    public:  { http: ['https://rpc-mainnet.vechain.energy'] }
  },
  blockExplorers: {
    default: { name: 'VeChain Explorer', url: 'https://explore.vechain.org' }
  }
});

/** ✅ NEW: VeChain testnet */
const vechainTestnet = defineChain({
  id: 100010,
  name: 'VeChain Testnet',
  network: 'vechain-testnet',
  nativeCurrency: { name: 'VeChain', symbol: 'VET', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.vechain.energy'] },
    public:  { http: ['https://rpc-testnet.vechain.energy'] }
  },
  blockExplorers: {
    default: { name: 'VeChain Testnet Explorer', url: 'https://explore-testnet.vechain.org' }
  },
  testnet: true
});

// (pick your chains)  🔁 add VeChain networks
export const networks = [base, sproutlyTestnet, polygon, vechain, vechainTestnet];

// ✅ Only two connectors: WalletConnect (AppKit shows QR)
const connectors = [
  walletConnect({ projectId, showQrModal: false })
];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks,
  // Provide explicit transports for custom chains
  transports: {
    [base.id]: http(),
    [vechain.id]: http('https://rpc-mainnet.vechain.energy'),
    [vechainTestnet.id]: http('https://rpc-testnet.vechain.energy')
  },
  connectors
});

export const config = wagmiAdapter.wagmiConfig;
