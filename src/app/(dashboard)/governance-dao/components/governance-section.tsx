"use client"

import Image from "next/image"

export default function GovernanceSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 mb-4">
            {/* --- Left: Governance Privileges --- */}
            <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] p-4 sm:p-4">
                {/* On small screens → stack vertically */}
                <div className="flex flex-col sm:flex-row items-stretch gap-6 h-full">
                    {/* LEFT: Text column */}
                    <div className="flex flex-col justify-between flex-1">
                        <div>
                            <h3 className="text-white font-semibold text-base sm:text-lg mb-2">
                                Your Governance Privileges
                            </h3>
                            <p className="text-gray-400 text-xs mb-1 tracking-wide">
                                Vote Weight
                            </p>
                            <p className="text-[#ADF151] text-5xl sm:text-6xl font-bold mb-3">
                                1.5x
                            </p>
                            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                                our votes carry a 1.5x weight in DAO proposals.
                            </p>
                        </div>

                        <button className="border border-[rgba(255,255,255,0.15)] text-white/80 font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all hover:bg-[rgba(255,255,255,0.1)] w-fit">
                            Learn More about Tier Staking
                        </button>
                    </div>

                    {/* RIGHT: Oak Tier card */}
                    <div className="relative w-full sm:w-[160px] md:w-[180px] aspect-[4/5] sm:aspect-auto rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-md flex-shrink-0 self-stretch">
                        <Image
                            src="/images/currentTier1.png"
                            alt="Oak Tier"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-3 backdrop-blur-[9px]">
                            <p className="text-white text-sm font-semibold">Oak Tier</p>
                            <p className="text-gray-300 text-xs font-bold">20,000 $SEED</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Right: Submit Proposal --- */}
            <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] p-4 sm:p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-white text-base sm:text-lg font-semibold mb-3">
                        Submit a New Proposal
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-md">
                        Have an idea to improve Sproutly? Submit a proposal for community
                        consideration. Co-sponsorship requirements apply based on your Tier
                        Staking level.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                    <button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] text-white text-sm font-medium rounded-full transition-colors border border-[rgba(255,255,255,0.15)]">
                        Create New Proposal
                    </button>
                    <button className="px-5 sm:px-6 py-2.5 sm:py-3 bg-transparent hover:bg-[rgba(255,255,255,0.1)] text-white text-sm font-medium rounded-full transition-colors border border-[rgba(255,255,255,0.15)]">
                        View Proposal Guidelines & Template
                    </button>
                </div>
            </div>
        </div>
    )
}
