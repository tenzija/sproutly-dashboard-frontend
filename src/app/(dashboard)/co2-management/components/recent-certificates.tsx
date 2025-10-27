"use client"

import { Download, Copy, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface Certificate {
  id: string
  name: string
  certId: string
  offset: number
  date: string
}

const certificates: Certificate[] = [
  { id: "1", name: "Carbon Offset Verification", certId: "#058", offset: 10, date: "2025-07-10" },
  { id: "2", name: "Carbon Offset Verification", certId: "#058", offset: 10, date: "2025-07-10" },
  { id: "3", name: "Carbon Offset Verification", certId: "#058", offset: 10, date: "2025-07-10" },
  { id: "4", name: "Carbon Offset Verification", certId: "#058", offset: 10, date: "2025-07-10" },
  { id: "5", name: "Carbon Offset Verification", certId: "#058", offset: 10, date: "2025-07-10" },
  { id: "6", name: "Carbon Offset Verification", certId: "#058", offset: 10, date: "2025-07-10" },
]

export function RecentCertificates() {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 6
  const totalPages = Math.ceil(certificates.length / itemsPerPage)

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
  }

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] px-4 py-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-white">Your Recent Certificates</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>

      <div className="min-w-full">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-teal-500/20">
              <th className="text-left py-2 px-3 text-white-500 font-medium">Name</th>
              <th className="text-left py-2 px-3 text-white-500 font-medium">ID</th>
              <th className="text-left py-2 px-3 text-white-500 font-medium">CO2 Offset</th>
              <th className="text-left py-2 px-3 text-white-500 font-medium">Minted Date</th>
              <th className="text-left py-2 px-3 text-white-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Existing code remains unchanged */}
            {certificates.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((cert) => (
              <tr key={cert.id} className="border-b border-teal-500/10 hover:bg-teal-500/5 transition-colors">
                <td className="py-[6.5px] px-4">
                  <div className="flex items-center gap-2">
                    {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime-400 to-teal-500" /> */}
                    <Image className="rounded-full"
                      src="/images/certificates.png" alt="Certificate Icon" width={24} height={24} />
                    <span className="text-white">{cert.name}</span>
                  </div>
                </td>
                <td className="py-[6.5px] px-4 text-gray-300">{cert.certId}</td>
                <td className="py-[6.5px] px-4 text-gray-300">{cert.offset}t</td>
                <td className="py-[6.5px] px-4 text-gray-300">{cert.date}</td>
                <td className="py-[6.5px] px-4">
                  <div className="flex items-center gap-2">
                    {/* PDF icon button */}
                    <button
                      className="p-1 hover:bg-teal-500/20 rounded transition-colors"
                      title="Download PDF"
                    >
                      <Image
                        src="/images/pdf.svg"
                        alt="PDF"
                        width={18}
                        height={18}
                        className="rounded-sm"
                      />
                    </button>

                    {/* NFT icon button */}
                    <button
                      className="p-1 hover:bg-teal-500/20 rounded transition-colors"
                      title="View NFT"
                    >
                      <Image
                        src="/images/nft.svg"
                        alt="NFT"
                        width={18}
                        height={18}
                        className="rounded-sm"
                      />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
