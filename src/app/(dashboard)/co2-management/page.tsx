"use client"
import { MintCertificates } from "./components/mint-certificates"
import { RecentCertificates } from "./components/recent-certificates"
import { CarbonFootprintCalculator } from "./components/carbon-footprint-calculator"
import { PriceStats } from "./components/price-stats"
import { TradeSaCO2 } from "./components/trade-saco2"

export default function CO2Dashboard() {
    return (
        <div className="flex min-h-screen bg-background">
            {/* Main Content */}
            <main className="flex-1 mt-4">
                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-1 space-y-6">
                        <MintCertificates />
                        <CarbonFootprintCalculator />
                    </div>

                    {/* Right Column - Tables and Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        <RecentCertificates />
                        <PriceStats />
                        <TradeSaCO2 />
                    </div>
                </div>
            </main>
        </div>
    )
}
