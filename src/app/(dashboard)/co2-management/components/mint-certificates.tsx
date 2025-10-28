"use client"

import { useState } from "react"

export function MintCertificates() {
  const [amount, setAmount] = useState("")

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] px-4 py-4">
      <h2 className="text-xl font-semibold text-white mb-2">Mint Carbon Offset Certificates</h2>
      <p className="text-sm text-gray-400 mb-6">Convert your $aCO₂ tokens into verifiable PDF and NFT carbon offset</p>

      {/* Available $aCO₂ */}
      <div
        className="flex flex-col items-center justify-center text-center gap-2
              p-4 rounded-[16px] border border-[rgba(255,255,255,0.09)]
             bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] opacity-100 mb-4"
      >
        <p className="text-sm text-gray-400">Available $aCO₂</p>
        <p className="text-[40px] font-bold text-[#ADF151] leading-tight tracking-wide">
          1,500 t
        </p>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Amount of $aCO₂ to Burn</label>
        <input
          type="text"
          placeholder="Text input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-[37px] w-full bg-slate-800/50 border border-[#FFFFFF99] rounded-full px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/60 transition-colors"
        />
      </div>

      {/* Burn Button and Text - Left Aligned */}
      <div className="flex flex-col gap-2">
        <button className="bg-[#ADF151] border border-[#ADF151] hover:bg-[#a8d63a] text-slate-900 font-semibold py-2 px-6 rounded-full transition-colors w-[136px]">
          Burn
        </button>
        <p className="text-xs text-gray-500">You will receive 1 Certificate NFT and a PDF</p>
      </div>
    </div>
  )
}
