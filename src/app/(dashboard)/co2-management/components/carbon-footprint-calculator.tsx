"use client"

import { useState } from "react"

export function CarbonFootprintCalculator() {
  const [activityType, setActivityType] = useState("flights")
  const [tripType, setTripType] = useState("round")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] px-8 py-4">
      <h2 className="text-xl font-semibold text-white mb-2">Carbon Footprint Calculator</h2>
      <p className="text-sm text-gray-400 mb-6">
        Estimate your CO₂ emissions from common activities like flights, events, or purchases
      </p>

      {/* Activity Type */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Activity Type</label>
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value)}
          className="w-full bg-slate-800/50 border border-teal-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60 transition-colors appearance-none cursor-pointer"
        >
          <option value="flights">Flights</option>
          <option value="events">Events</option>
          <option value="purchases">Purchases</option>
        </select>
      </div>

      {/* Flight Emissions Details */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Flight Emissions Details</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="round"
                checked={tripType === "round"}
                onChange={(e) => setTripType(e.target.value)}
                className="w-4 h-4 accent-lime-400"
              />
              <span className="text-sm text-gray-300">Round Trip</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="oneway"
                checked={tripType === "oneway"}
                onChange={(e) => setTripType(e.target.value)}
                className="w-4 h-4 accent-lime-400"
              />
              <span className="text-sm text-gray-300">One way</span>
            </label>
          </div>
        </div>

        {/* From/To Inputs */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Fly from</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-slate-800/50 border border-teal-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60 transition-colors appearance-none cursor-pointer"
          >
            <option value="">From</option>
            <option value="nyc">New York</option>
            <option value="la">Los Angeles</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">Fly to</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-slate-800/50 border border-teal-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-teal-500/60 transition-colors appearance-none cursor-pointer"
          >
            <option value="">To</option>
            <option value="london">London</option>
            <option value="tokyo">Tokyo</option>
          </select>
        </div>
      </div>

      {/* Calculate Button */}
      <button className="w-full bg-[#ADF151] border border-[#ADF151] hover:bg-[#a8d63a] text-slate-900 font-semibold py-3 rounded-full transition-colors">
        Calculate
      </button>

      {/* Estimated Emissions */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400 mb-2">Estimated Emissions (CO2)</p>
        <p className="text-4xl font-bold text-[#ADF151]">2500</p>
        <p className="text-sm text-gray-400">Tonnes</p>
      </div>
    </div>
  )
}
