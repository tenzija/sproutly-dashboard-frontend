"use client"

import { useState } from "react"
import BuySellToggle from "./BuySellToggle"

export function TradeSaCO2() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] px-4 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Trade $aCO₂ Tokens</h2>
          <p className="text-sm text-gray-400">
            Buy or sell $aCO₂ tokens against $SEED. Prices are dynamically adjusted based on current pool liquidity.*
          </p>
        </div>
        <BuySellToggle activeTab={activeTab} setActiveTab={setActiveTab} />

      </div>

      {/* Buy Section */}
      {activeTab === "buy" && (
        <div className="space-y-6">
          <div className="text-sm text-gray-400 mb-2 block">
            Buy $aCO₂
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 ">
            {/* You will Receive Box */}
            <div className="w-full md:flex-1 bg-slate-800/30 border border-teal-500/20 rounded-2xl p-6">
              <p className="text-sm text-gray-400 mb-4">You will <span className="text-[#ADF151]">Receive</span></p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Text input"
                  className="flex-1 bg-slate-800/50 border border-[#FFFFFF99] rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/60 transition-colors"
                />
                <span className="text-gray-400 font-medium whitespace-nowrap">Tonnes</span>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="text-2xl text-lime-400 md:mb-6">↔</div>

            {/* You will Pay Box */}
            <div className="w-full md:flex-1 bg-slate-800/30 border border-teal-500/20 rounded-2xl p-6">
              <p className="text-sm text-gray-400 mb-4">You will <span className="text-[#ADF151]">Pay</span></p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">2500</p>
                <p className="text-gray-400">$SEED</p>
              </div>
            </div>
          </div>

          <button className="w-[205px] bg-[#ADF151] border border-[#ADF151] hover:bg-[#a8d63a] text-slate-900 font-semibold py-3 rounded-full transition-colors">
            Buy $aCO₂
          </button>
        </div>
      )}

      {/* Sell Section */}
      {activeTab === "sell" && (
        <div className="space-y-6">
          <div className="text-sm text-gray-400 mb-2 block">
            Sell $aCO₂
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 ">
            {/* You will Receive Box */}
            <div className="w-full md:flex-1 bg-slate-800/30 border border-teal-500/20 rounded-2xl p-6">
              <p className="text-sm text-gray-400 mb-4">You will <span className="text-[#ADF151]">Receive</span></p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Text input"
                  className="flex-1 bg-slate-800/50 border border-[#FFFFFF99] rounded-full px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/60 transition-colors"
                />
                <span className="text-gray-400 font-medium whitespace-nowrap">Tonnes</span>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="text-2xl text-lime-400 md:mb-6">↔</div>

            {/* You will Pay Box */}
            <div className="w-full md:flex-1 bg-slate-800/30 border border-teal-500/20 rounded-2xl p-6">
              <p className="text-sm text-gray-400 mb-4">You will <span className="text-[#ADF151]">Pay</span></p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-white">2500</p>
                <p className="text-gray-400">$SEED</p>
              </div>
            </div>
          </div>

          <button className="w-[205px] bg-[#ADF151] border border-[#ADF151] hover:bg-[#a8d63a] text-slate-900 font-semibold py-3 rounded-full transition-colors">
            Sell $aCO₂
          </button>
        </div>
      )}
    </div>
  )
}
