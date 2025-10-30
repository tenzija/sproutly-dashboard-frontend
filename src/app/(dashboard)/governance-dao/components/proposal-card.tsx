"use client"

import { ThumbsUp, ThumbsDown } from "lucide-react"

interface ProposalCardProps {
    proposal: {
        id: string
        title: string
        status: string
        description: string
        votes: {
            upvotes: string
            downvotes: string
        }
    }
}

export default function ProposalCard({ proposal }: ProposalCardProps) {
    return (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] p-6">
            {/* Header */}
            <div className="mb-4">
                <p className="text-gray-500 text-xs font-medium mb-2">{proposal.id}</p>
                <div className="flex items-center justify-between gap-4 mb-3">
                    <h3 className="text-white text-sm font-semibold">{proposal.title}</h3>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/40 whitespace-nowrap">
                        {proposal.status}
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-xs leading-relaxed mb-4">{proposal.description}</p>

            {/* View Full Proposal */}
            <button className="text-gray-500 hover:text-gray-400 text-xs font-medium mb-4 transition-colors">
                View Full Proposal
            </button>

            {/* Vote Section */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className="flex gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <ThumbsUp size={14} className="text-emerald-400" />
                        <span>{proposal.votes.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThumbsDown size={14} className="text-red-500" />
                        <span>{proposal.votes.downvotes}</span>
                    </div>
                </div>

                {/* Vote Buttons */}
                <div className="flex gap-2">
                    <button className="p-2 border border-emerald-500/40 hover:border-emerald-500/60 hover:bg-emerald-500/10 rounded-lg transition-colors">
                        <ThumbsUp size={18} className="text-emerald-400" />
                    </button>
                    <button className="p-2 border border-red-500/40 hover:border-red-500/60 hover:bg-red-500/10 rounded-lg transition-colors">
                        <ThumbsDown size={18} className="text-red-500" />
                    </button>
                </div>
            </div>
        </div>
    )
}
