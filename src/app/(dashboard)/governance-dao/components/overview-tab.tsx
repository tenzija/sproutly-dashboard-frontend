"use client"

import ActiveProposals from "./active-proposals"
import GovernanceSection from "./governance-section"
import StatsCards from "./stats-cards"

export default function OverviewTab() {
    return (
        <>
            {/* Stats Cards */}
            <div className="mt-8 mb-12">
                <StatsCards />
            </div>

            {/* Governance Privileges + Submit Proposal (2 Column) */}
            <GovernanceSection />

            {/* Active Voting Proposals */}
            <ActiveProposals />
        </>
    )
}