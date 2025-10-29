// components/ui/tabs.tsx
'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

function Tabs({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            className={cn('flex flex-col gap-2', className)}
            {...props}
        />
    )
}

function TabsList({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
    return (
        <TabsPrimitive.List
            data-slot="tabs-list"
            className={cn(
                "inline-flex items-center justify-start gap-6 border-b border-[rgba(255,255,255,0.1)] mb-4 pb-1",
                className
            )}
            {...props}
        />
    )
}

function TabsTrigger({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
    return (
        <TabsPrimitive.Trigger
            data-slot="tabs-trigger"
            className={cn(
                // Base text size = h3 style
                "relative inline-flex items-center justify-center px-4 py-2 text-[20px] font-medium text-[rgba(255,255,255,0.6)] transition-all duration-300 ease-in-out",
                // Hover + focus
                "hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#adf151]/50",
                // Active tab style (bold white + underline)
                "data-[state=active]:text-white data-[state=active]:font-semibold",
                "data-[state=active]:after:content-[''] data-[state=active]:after:absolute data-[state=active]:after:bottom-[-4px] data-[state=active]:after:left-0 data-[state=active]:after:w-full data-[state=active]:after:h-[2px] data-[state=active]:after:bg-[#adf151] data-[state=active]:after:rounded-full",
                // Transition for underline
                "after:transition-all after:duration-300 after:ease-in-out",
                className
            )}
            {...props}
        />
    );
}



function TabsContent({
    className,
    ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
    return (
        <TabsPrimitive.Content
            data-slot="tabs-content"
            className={cn('flex-1 outline-none', className)}
            {...props}
        />
    )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }