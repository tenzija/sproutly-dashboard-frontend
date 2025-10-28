"use client"

export function PriceStats() {
  const stats = [
    {
      label: "Current $aCO₂ Price",
      value: "0.25",
      unit: "$SEED / Tonne",
      change: "-0.08%",
      timeframe: "in 24 hours",
      trend: "down",
    },
    {
      label: "Total Pool Liquidity",
      value: "50,000",
      unit: "$aCO₂",
      change: "-0.05%",
      timeframe: "in 24 hours",
      trend: "down",
    },
    {
      label: "Daily Volume",
      value: "8,500",
      unit: "$aCO₂",
      change: "+0.15%",
      timeframe: "in 24 hours",
      trend: "up",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] p-4"
        >
          <p className="text-sm text-gray-400 mb-3">{stat.label}</p>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-3xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.unit}</p>
          </div>
          <p className={`text-sm ${stat.trend === "up" ? "text-[#ADF151]" : "text-[#EF5350]"}`}>
            {stat.change} {stat.timeframe}
          </p>
        </div>
      ))}
    </div>
  )
}
