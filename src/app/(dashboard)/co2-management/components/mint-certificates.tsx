"use client"

import { useState } from "react"

export function MintCertificates() {
  const [amount, setAmount] = useState("")

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] px-8 py-4">
      <h2 className="text-xl font-semibold text-white mb-2">Mint Carbon Offset Certificates</h2>
      <p className="text-sm text-gray-400 mb-6">Convert your $aCO₂ tokens into verifiable PDF and NFT carbon offset</p>

      {/* Available $aCO₂ */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-2">Available $aCO₂</p>
        <p className="text-4xl font-bold text-[#ADF151]">1,500 t</p>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Amount of $aCO₂ to Burn</label>
        <input
          type="text"
          placeholder="Text input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-slate-800/50 border border-teal-500/30 rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/60 transition-colors"
        />
      </div>

      {/* Burn Button */}
      <button className="w-full bg-[#ADF151] border border-[#ADF151] hover:bg-[#a8d63a] text-slate-900 font-semibold py-3 rounded-full transition-colors mb-3">
        Burn
      </button>

      <p className="text-xs text-gray-500 text-center">You will receive 1 Certificate NFT and a PDF</p>
    </div>
  )
}
