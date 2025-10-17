"use client"

import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import { ReactNode } from "react"

interface LandplotCardProps {
    title: string
    icon: string
    stakingSpots: string
    treesStaked: string
    cbyLocked: string
    buttonText: string
    leadingIcon?: ReactNode            // NEW
}

export default function LandplotCard({
    title,
    icon,
    stakingSpots,
    treesStaked,
    cbyLocked,
    buttonText,
    leadingIcon,
}: LandplotCardProps) {
    return (
        <div className="h-full bg-card rounded-2xl flex flex-col bg-[rgba(137,137,137,0.05)] py-4 px-8 backdrop-blur-[150px] border border-[rgba(255,255,255,0.09)]">
            {/* Header with leading icon */}
            <div className="flex items-center gap-3 mb-6">
                {leadingIcon && (
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center
                           rounded-md border border-white/10 bg-white/5">
                        {leadingIcon}
                    </span>
                )}
                <h3 className="text-xl font-bold text-foreground">{title}</h3>
            </div>

            {/* Image */}
            <div className="relative w-full mb-6 rounded-xl overflow-hidden bg-gradient-to-b from-accent/20 to-accent/5 p-4 aspect-[5/3]">
                <Image src={icon} alt={`${title} icon`} fill className="object-contain" />
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6 flex-1">
                <p className="text-sm text-foreground/70">{stakingSpots}</p>
                <p className="text-sm text-foreground/70">{treesStaked}</p>
                <p className="text-sm text-foreground/70">{cbyLocked}</p>
            </div>

            {/* Buy Button */}
            <button className="w-full bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-lg py-3 px-4 font-semibold transition-colors flex items-center justify-center gap-2">
                <ShoppingCart size={18} />
                {buttonText}
            </button>
        </div>
    )
}
