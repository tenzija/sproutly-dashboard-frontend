"use client"

export default function StatsCards() {
    const stats = [
        {
            label: "Total $ACO, Burned for Votes",
            value: "8,234",
            sublabel: "Total CO2 offset by community votes",
        },
        {
            label: "Active Proposals",
            value: "5",
            sublabel: "Currently open for voting",
        },
        {
            label: "DAO Treasury",
            value: "1,250,000",
            sublabel: "Funds managed by the community",
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
                <div key={index} className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] px-4 py-4">
                    <p className="text-gray-400 font-medium mb-3">{stat.label}</p>
                    <p className="text-white text-3xl font-bold mb-2">{stat.value}</p>
                    <p className="text-gray-400 text-xs">{stat.sublabel}</p>
                </div>
            ))}
        </div>
    )
}
