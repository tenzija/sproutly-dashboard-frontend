import React from "react";

function LockCard() {
  return (
    <div className="relative w-full rounded-[20px] bg-[url('/images/bg1.jpg')] bg-cover bg-center bg-no-repeat p-5 md:p-4">
     <div className="w-full rounded-[16px] border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] p-6 gap-4">

  {/* Header */}
  <div className="flex flex-col items-start mb-6">
    <span className="text-[#8e98b3] text-[16px] mb-1.5 tracking-wide">#001</span>
    <h2 className="text-[28px] font-bold m-0">10,000 <span className="text-[#81e490]">$CBY</span></h2>
  </div>

  {/* Details */}
  <div className="flex justify-between mb-5">
    <div className="flex flex-col items-center">
      <span className="text-[#afcaaf] text-[13px]">Lock Period</span>
      <span className="mt-1 text-[20px] font-semibold">12 Months</span>
    </div>
    <div className="flex flex-col items-center border-l border-r border-[rgba(255,255,255,0.09)] px-4">
      <span className="text-[#afcaaf] text-[13px]">Total $SEED to be Received</span>
      <span className="mt-1 text-[20px] font-semibold text-[#e7e7e7]">12,000</span>
    </div>
    <div className="flex flex-col items-center">
      <span className="text-[#afcaaf] text-[13px]">Claimable $SEED</span>
      <span className="mt-1 text-[20px] font-semibold text-[#81e490]">500</span>
    </div>
  </div>

  {/* Progress Section */}
  <div className="mb-4">
    <span className="text-[#afcaaf] text-[13px] mb-2 block">September 8, 2025</span>
    <div className="flex items-center">
      <div className="relative w-full h-1.5 bg-[#223426] rounded-[6px] mr-3">
        <span className="block h-full bg-[#81e490] rounded-l-[6px]" style={{ width: "25%" }}></span>
      </div>
      <span className="text-[#afcaaf] text-[13px]">25%</span>
    </div>
  </div>

  {/* Time Remaining */}
  <div className="mb-4">
    <span className="text-[#afcaaf] text-[13px] block">Time Remaining</span>
    <span className="text-[18px] font-semibold text-white block">11 Months, 15 Days</span>
  </div>

  {/* Claim Button */}
  <button className="bg-[#adf151] text-[#083214] text-[14px] font-semibold rounded-[20px] px-4 py-2 w-[160px] h-[36px] transition-colors duration-200 hover:bg-[#c2ee5b] text-center whitespace-nowrap self-start md:text-[12px] md:px-3 md:py-1.5 md:h-[32px] md:w-[140px]">
    Claim Vested $SEED
  </button>
</div>

    </div>
  );
}

export default LockCard;
