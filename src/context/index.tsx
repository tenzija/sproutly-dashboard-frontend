"use client";

import { wagmiAdapter, projectId } from "../config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, arbitrum, polygon, base } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { defineChain } from 'viem'

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error("Project ID is not defined");
}

// Set up metadata
const metadata = {
  name: "appkit-example",
  description: "AppKit Example",
  url: "https://appkitexampleapp.com", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const sproutlyTestnet = defineChain({
  id: 1313161798,
  name: 'Sproutly Testnet',
  network: 'sproutly-testnet',
  nativeCurrency: {
    name: 'vMock Token',
    symbol: 'vMock',
    decimals: 18
  },
  rpcUrls: {
    default: { http: ['https://0x4e454246.rpc.aurora-cloud.dev'] },
    public: { http: ['https://0x4e454246.rpc.aurora-cloud.dev'] }
  },
  blockExplorers: {
    default: { name: 'Sproutly Explorer', url: 'https://explorer.sproutly-testnet.io' }
  },
  testnet: true
})

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, polygon, base,sproutlyTestnet],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: false,
    socials: false,
    email:false,
    
  },
  
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
