"use client"

import ProposalCard from "./proposal-card"

export default function ActiveProposals() {
    const proposals = [
        {
            id: "#004",
            title: "Fund Community Marketing Campaign",
            status: "VOTING LIVE",
            description: "Allocate 50,000 $SEED from the DAO Treasury to fund a Q4 2025 community-led marketing initiative",
            votes: {
                upvotes: "1,350 $ACO (80%)",
                downvotes: "325 $ACO (20%)",
            },
        },
        {
            id: "#004",
            title: "Fund Community Marketing Campaign",
            status: "VOTING LIVE",
            description: "Allocate 50,000 $SEED from the DAO Treasury to fund a Q4 2025 community-led marketing initiative",
            votes: {
                upvotes: "1,350 $ACO (80%)",
                downvotes: "325 $ACO (20%)",
            },
        },
        {
            id: "#004",
            title: "Fund Community Marketing Campaign",
            status: "VOTING LIVE",
            description: "Allocate 50,000 $SEED from the DAO Treasury to fund a Q4 2025 community-led marketing initiative",
            votes: {
                upvotes: "1,350 $ACO (80%)",
                downvotes: "325 $ACO (20%)",
            },
        },
    ]

    return (
        <div>
            <h2 className="text-white text-2xl sm:text-xl font-semibold mb-4 sm:mb-4">
                Active Voting Proposals
            </h2>

            <div className="space-y-4">
                {proposals.map((proposal, index) => (
                    <ProposalCard key={index} proposal={proposal} />
                ))}
            </div>
        </div>
    )
}
