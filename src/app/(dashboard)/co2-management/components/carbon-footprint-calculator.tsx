"use client"

import { Images } from "@/assets"
import Image from "next/image"
import { useState } from "react"

export function CarbonFootprintCalculator() {
  const [activityType, setActivityType] = useState("flights")
  const [tripType, setTripType] = useState("round")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] px-4 py-4">
      <h2 className="text-xl font-semibold text-white mb-2">Carbon Footprint Calculator</h2>
      <p className="text-sm text-gray-400 mb-6">
        Estimate your CO₂ emissions from common activities like flights, events, or purchases
      </p>

      {/* Activity Type */}
      <div className="mb-6 relative w-full">
        <label className="text-sm text-gray-400 mb-2 block">Activity Type</label>

        <div
          className="flex items-center justify-between
              w-full h-[37px]
              border border-[#FFFFFF99]
              bg-slate-800/50
              backdrop-blur-[150px]
              rounded-[33px]
              px-4 py-2
              cursor-pointer
              relative"
        >
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full bg-transparent text-white text-sm outline-none
                 appearance-none cursor-pointer pr-8"
          >
            <option value="flights">Flights</option>
            <option value="events">Events</option>
            <option value="purchases">Purchases</option>
          </select>

          {/* Use your SVG asset instead of inline icon */}
          <Image
            src={Images.ChevDown}  // update this path to match your asset
            alt="Dropdown arrow"
            width={16}
            height={16}
            className="absolute right-4 pointer-events-none opacity-70"
          />
        </div>
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
                className="w-4 h-4 accent-white"
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
                className="w-4 h-4 accent-white"
              />
              <span className="text-sm text-gray-300">One way</span>
            </label>
          </div>
        </div>

        {/* From/To Inputs */}
        <div className="mb-6 relative w-full">
          <label className="text-sm text-gray-400 mb-2 block">Fly from</label>
          <div
            className="flex items-center justify-between
              w-full h-[37px]
              border border-[#FFFFFF99]
              bg-slate-800/50
              backdrop-blur-[150px]
              rounded-[33px]
              px-4 py-2
              cursor-pointer
              relative"
          >
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-transparent text-white text-sm outline-none
                 appearance-none cursor-pointer pr-8"
            >
              <option value="">From</option>
              <option value="nyc">New York</option>
              <option value="la">Los Angeles</option>
            </select>
            <Image
              src={Images.ChevDown}  // update this path to match your asset
              alt="Dropdown arrow"
              width={16}
              height={16}
              className="absolute right-4 pointer-events-none opacity-70"
            />
          </div>
        </div>

        <div className="mb-2 relative w-full">
          <label className="text-sm text-gray-400 mb-2 block">Fly to</label>
          <div
            className="flex items-center justify-between
              w-full h-[37px]
              border border-[#FFFFFF99]
              bg-slate-800/50
              backdrop-blur-[150px]
              rounded-[33px]
              px-4 py-2
              cursor-pointer
              relative"
          >
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-transparent text-white text-sm outline-none
                 appearance-none cursor-pointer pr-8"
            >
              <option value="">To</option>
              <option value="london">London</option>
              <option value="tokyo">Tokyo</option>
            </select>
            <Image
              src={Images.ChevDown}  // update this path to match your asset
              alt="Dropdown arrow"
              width={16}
              height={16}
              className="absolute right-4 pointer-events-none opacity-70"
            />
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      {/* <button className="w-full bg-[#ADF151] border border-[#ADF151] hover:bg-[#a8d63a] text-slate-900 font-semibold py-3 rounded-full transition-colors">
        Calculate
      </button> */}

      <button className="bg-[#ADF151] border border-[#ADF151] hover:bg-[#a8d63a] text-slate-900 font-semibold py-2 px-6 rounded-full transition-colors w-[136px]">
        Calculate
      </button>

      {/* Estimated Emissions */}
      <div className="mt-6 text-center border border-[rgba(255,255,255,0.09)] p-4 rounded-[16px]">
        <p className="text-sm text-gray-400 mb-2">Estimated Emissions (CO₂)</p>

        {/* Number + Unit inline */}
        <div className="flex items-end justify-center gap-2">
          <p className="text-4xl font-bold text-[#ADF151] leading-none">2500</p>
          <p className="text-base text-white-700">Tonnes</p>
        </div>
      </div>

    </div>
  )
}
