"use client"

import { Crown, Gem, Trees } from "lucide-react"
import ClaimSection from "./components/claim-section"
import LandplotCard from "./components/landplot-card"
import MetricsCard from "./components/metrics-card"

export default function StakingDashboard() {
    return (
        <div className="flex min-h-screen bg-background">

            <main className="flex-1 mt-4">

                <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] px-8 py-4">

                    {/* Metrics Grid */}
                    <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-5 flex">
                        <MetricsCard label="STAKED TREES" value="0 / 0 trees" />
                        <MetricsCard label="PLOTS AVAILABILITY" value="0 / 0 trees" sublabel="Trees staked / available spots" />
                        <MetricsCard label="AVAILABLE SCBY" value="0.00 $CBY" sublabel="Enough to stake 0 NFTrees" />
                        <MetricsCard label="YEARLY EST REWARDS" value="0 $aCO₂" />
                    </div>

                    {/* Landplot Cards */}
                    <div className="mb-5">
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            <LandplotCard
                                title="Genesis Landplot"
                                icon="/images/genesis-plot.png"
                                stakingSpots="0 staking spots available"
                                treesStaked="0 trees staked"
                                cbyLocked="0.00 CBY locked"
                                buttonText="Buy Genesis landplot"
                                leadingIcon={<Gem className="h-4 w-4 text-emerald-300" />}
                            />

                            <LandplotCard
                                title="Rare Landplot"
                                icon="/images/premium-plot.png"
                                stakingSpots="0 staking spots available"
                                treesStaked="0 trees staked"
                                cbyLocked="0.00 CBY locked"
                                buttonText="Buy Rare Landplot"
                                leadingIcon={<Crown className="h-4 w-4 text-amber-300" />}
                            />

                            <LandplotCard
                                title="Standard Landplot"
                                icon="/images/standard-plot.png"
                                stakingSpots="0 staking spots available"
                                treesStaked="0 trees staked"
                                cbyLocked="0.00 CBY locked"
                                buttonText="Buy Standard landplot"
                                leadingIcon={<Trees className="h-4 w-4 text-teal-300" />}
                            />
                        </div>
                    </div>



                    {/* Claim Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                        <ClaimSection title="Claim your staking" subtitle="Wallet balance" balance={1000} />
                        <ClaimSection title="Claim your staking $aCO₂" subtitle="Claim available $aCO₂ from staking" balance={1000} />
                    </div>

                    {/* Content */}
                    <div className="relative p-5 sm:p-6 md:p-8  rounded-2xl bg-[rgba(137,137,137,0.05)] py-4 px-8 backdrop-blur-[150px] border border-[rgba(255,255,255,0.09)]">
                        <h2 className="text-2xl font-bold text-white mb-3 sm:mb-4">Staking Info</h2>
                        <ul className="list-disc pl-5 text-white/90 space-y-2 leading-relaxed">
                            <li>
                                You need $5 worth of CBY per each tree staked to be able to stake (i.e. 50 trees = 250$ worth of CBY)
                            </li>
                            <li>
                                If you decide to unstake the NFTrees, the $CBY will be returned minus a fee. In the first year, the fee is
                                7.5%, it reduces to 3.75% in the second year, and after that, the fee drops to 1.75%.
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    )
}
