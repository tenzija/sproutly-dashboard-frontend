"use client";

import LockCard from "./components/LockCard";
import Bridge from "./components/Bridge";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount, useReadContract } from "wagmi";
import { CBY_ABI } from "@/constant/BlockchainConstants";
import { formatToken } from "@/utils/helper";

import "./Swapportal.scss";

const NEXT_PUBLIC_CBY_ADDRESS = process.env.NEXT_PUBLIC_CBY_ADDRESS;
const NEXT_PUBLIC_CBY_DECIMALS = Number(process.env.NEXT_PUBLIC_CBY_DECIMALS) || 18;
function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address: currentAddress, isConnected } = useAccount();


  const [value, setValue] = useState<string | undefined>("0.00");
  const { data } = useReadContract({
    address: NEXT_PUBLIC_CBY_ADDRESS as `0x${string}`,
    abi: CBY_ABI,
    functionName: "balanceOf",
    args: [currentAddress],
  });

  useEffect(() => {
    const getData = async () => {
      await data;
      if (data !== undefined) {
        const ethValue = formatToken(data as bigint, NEXT_PUBLIC_CBY_DECIMALS);
        setValue(ethValue);
      }
    };
    getData().catch(console.error);
  }, [data]);

  const handleStartSwap = () => {
    setIsModalOpen(true);
  };

  if (isConnected) {
    return (
      <>
        <div className="w-full flex justify-between items-center gap-4 p-8 bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] border border-[rgba(255,255,255,0.09)] rounded-xl  md:h-[396px] h-auto  md:flex-row flex-col ">
          {/* Left Section */}
          <div className="flex flex-col items-center md:w-1/2 w-100 gap-4">
            <h2 className="text-center text-2xl font-bold">
              Ready to Grow Your SEED?
            </h2>
            <p className="text-center">
              Swap your $CBY for $SEED tokens and earn more with longer lock-up
              periods. Your tokens on the BASE chain are ready for action.
            </p>

            <div className="flex flex-col items-center justify-center gap-2 w-[221px] h-[97px] p-4 bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] border border-[rgba(255,255,255,0.09)] rounded-lg">
              <p className="text-center font-medium text-[12px] leading-4">
                Available $CBY Balance
              </p>
              <div className="flex justify-center items-center gap-2 w-full whitespace-nowrap">
                <h1 className="text-[24px] text-[#adf151]">{value}</h1>
                <h2 className="text-[22px]">$CBY</h2>
              </div>
              <p className="text-center font-medium text-[12px] leading-4">
                In Base Chain
              </p>
            </div>

            <h3 className="text-center text-lg font-semibold">
              Your $CBY for Swap
            </h3>
            <button className="bg-[#adf151] text-[#233010] font-bold text-[16px] leading-[19.2px] px-4 py-3 rounded-[51px]" onClick={handleStartSwap}>
              Start New Swap
            </button>
          </div>

          <div className="flex flex-col items-center justify-center w-1/2">
            <div className="flex justify-center items-center md:w-auto w-100 h-100 overflow-hidden rounded-[32px] border border-[rgba(255,255,255,0.09)] shadow-[0_4px_18px_rgba(0,0,0,0.25)]">
              <Image
                src="/images/Frame 14.png"
                alt="Connect Wallet"
                width={565}
                height={372}
                className="object-cover w-auto h-100"
              />
            </div>
          </div>
        </div>
        <div className="w-full">
          <h3
            className="text-[34px] font-bold text-white my-6 
             md:text-[34px] md:mb-4 md:mt-0 font-sans"
          >
            Active Lock
          </h3>
          <div
            className="grid grid-cols-2 gap-x-6 gap-y-6 w-full
            max-[1200px]:gap-x-5 max-[1200px]:gap-y-5
            max-[768px]:grid-cols-1 max-[768px]:gap-x-4 max-[768px]:gap-y-4"
          >
            <LockCard />
            <LockCard />
            <LockCard />
            <LockCard />
          </div>
        </div>
        <Bridge isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  } else {
    return (
      <div className="flex flex-col items-center justify-center text-center h-[615px] rounded-lg p-4 gap-2 mt-4 bg-[var(--glass-new,#8989890d)] backdrop-blur-[150px] border border-[var(--glass-stroke-new,#ffffff17)] shadow-[3px_3px_3px_rgba(0,0,0,0.089)]">
        <Image
          src="/images/ConnectWallet.png"
          alt="Connect Wallet"
          width={144}
          height={144}
          className="rounded-[32px] object-cover"
        />
        <p className="text-[32px] font-bold text-[var(--Green--100)]">
          Connect Your Wallet to Begin
        </p>
        <p className="text-sm font-medium text-[var(--white-80)] max-w-[430px] leading-[21px]">
          To access the Swap Portal and start exchanging your $CBY for $SEED,
          please connect your Web3 wallet
        </p>
      </div>
    );
  }
}

export default Page;
