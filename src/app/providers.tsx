// src/app/providers.tsx
'use client';

import React, { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, cookieToInitialState, type State } from 'wagmi';  // Use State type here
import { wagmiConfig } from "@/lib/appkit.client";

// Define the type for the cookies prop
interface ProvidersProps {
    children: ReactNode;
    cookies: string | null;
}

export default function Providers({ children, cookies }: ProvidersProps) {
    const [queryClient] = useState(() => new QueryClient());
    const [initialState, setInitialState] = useState<State | null>(null);  // Use State instead of Config

    useEffect(() => {
        if (cookies) {
            // Initialize the state based on cookies and wagmiConfig
            const state = cookieToInitialState(wagmiConfig, cookies);
            setInitialState(state ?? null); // Ensure state is State or null
        }
    }, [cookies]);

    // Wait for the initial state to be set before rendering
    if (!initialState) {
        return null; // or a loading spinner until state is ready
    }

    return (
        <WagmiProvider config={wagmiConfig} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
