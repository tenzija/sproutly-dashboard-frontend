"use client";

import { wagmiAdapter, projectId } from "../config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { base } from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { defineChain } from "viem";

const queryClient = new QueryClient();
if (!projectId) throw new Error("Project ID is not defined");

// ✅ Keep your custom chain
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

const metadata = {
  name: "appkit-example",
  description: "AppKit Example",
  url: "https://appkitexampleapp.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"]
};

// Create the AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  // ✅ Include your custom testnet alongside Base
  networks: [base, sproutlyTestnet],
  defaultNetwork: base,
  metadata,

  // Disable non-wallet sign-ins
  features: {
    analytics: false,
    socials: false,
    email: false
  },

  // ✅ Hide curated WC directory so only MetaMask + WalletConnect appear
  allWallets: "HIDE",
  enableCoinbase: false,
  // enableWalletConnect: false,

  // ✅ Global typography: affects built-in error UI labels like "Try Again"
  themeVariables: {
    '--w3m-font-family': 'Montserrat', // picks up global value
  },
});

function ContextProvider({
  children,
  cookies
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
