// src/app/providers.tsx
'use client';

// Ensure AppKit init runs on the client before children render:
import '@/lib/appkit.client';            // side-effect import guarantees createAppKit runs
// OR, if you prefer explicit:
import { appKit } from '@/lib/appkit.client';
void appKit;

import React, { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, cookieToInitialState, type State } from 'wagmi';
import { wagmiConfig } from '@/lib/appkit.client';

interface ProvidersProps { children: React.ReactNode; cookies: string | null; }

export default function Providers({ children, cookies }: ProvidersProps) {
    const [queryClient] = useState(() => new QueryClient());

    const initialState: State | undefined = useMemo(() => {
        if (!cookies || !cookies.trim()) return undefined;
        try { return cookieToInitialState(wagmiConfig, cookies) ?? undefined; }
        catch { return undefined; }
    }, [cookies]);

    return (
        <WagmiProvider config={wagmiConfig} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    );
}
