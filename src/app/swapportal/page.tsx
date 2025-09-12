"use client";

import PageHeader from "../components/pageHeader/PageHeader";
import LockCard from "./components/LockCard";
import Bridge from "./components/Bridge";
import React, { useEffect, useState } from "react";

import Image from "next/image";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import {
  useAppKitProvider,
  useAppKitNetworkCore,
  type Provider,
} from "@reown/appkit/react";
import { BrowserProvider, formatEther } from "ethers";
function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balance, setbalance] = useState("0.0000");
  const { address, isConnected } = useAccount();
  const { chainId } = useAppKitNetworkCore();
  // AppKit hook to get the wallet provider
  const { walletProvider } = useAppKitProvider<Provider>("eip155");
  const { open, close } = useAppKit();
  const handleClick = () => {
    if (isConnected) {
      close();
    } else {
      open();
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletProvider || !address || !chainId) return;
      try {
        const provider = new BrowserProvider(walletProvider, chainId);
        const balance = await provider.getBalance(address);
        const eth = formatEther(balance);
        console.log(`${eth} ETH`);

        setbalance(parseFloat(eth).toFixed(4));
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };

    fetchBalance();
  }, [address, walletProvider, chainId]);

  if (!isConnected) {
    return (
      <div className="mt-4 flex flex-col gap-6 md:gap-4">
        <PageHeader
          title="Swap Portal"
          showSearch={false}
      
        />
        <div className="flex flex-col items-center justify-center text-center h-[615px] rounded-lg p-4 gap-2 mt-4 bg-[var(--glass-new,#8989890d)] backdrop-blur-[150px] border border-[var(--glass-stroke-new,#ffffff17)] shadow-[3px_3px_3px_rgba(0,0,0,0.089)]">
          <Image
            src="/images/ConnectWallet.png"
            alt="Connect Wallet"
            width={144}
            height={144}
            className="rounded-[32px] object-cover"
          />
          <p className="text-[32px] font-bold text-[var(--Green--100)]">Connect Your Wallet to Begin</p>
          <p className="text-sm font-medium text-[var(--white-80)] max-w-[430px] leading-[21px]">
            To access the Swap Portal and start exchanging your $CBY for $SEED,
            please connect your Web3 wallet
          </p>
         <button className="bg-[var(--Green--100)] text-black text-[16px] font-bold px-4 py-3 
                   rounded-[51px] w-[205px] h-[44px] border-none cursor-pointer 
                   transition-all duration-200 ease-in-out 
                   hover:bg-[#9de142] hover:-translate-y-0.5" onClick={handleClick}>
            Connect Wallet
          </button>
        </div>

        {/* Reusable Wallet Connection Popup */}
        {/* <WalletConnectPopup
          isOpen={popup}
          onClose={() => setPopup(false)}
          onWalletConnect={handleWalletConnect}
          title="Connect Your Wallet"
          showHelpLinks={true}
        /> */}
        {/* {popup && <WalletPop setPopup={setpopup} />} */}
      </div>
    );
  }
  return (
    <div className="mt-4 flex flex-col gap-6 md:gap-4">
      <PageHeader title="Swap Portal" showSearch={false}  />
      <div className="w-full flex justify-between items-center gap-4 p-8 bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] border border-[rgba(255,255,255,0.09)] rounded-xl h-[396px]">
        {/* Left Section */}
        <div className="flex flex-col items-center w-1/2 gap-4">
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
              <h1 className="text-[24px] text-[#adf151]">{balance}</h1>
              <h2 className="text-[22px]">$CBY</h2>
            </div>
            <p className="text-center font-medium text-[12px] leading-4">
              In Base Chain
            </p>
          </div>

          <h3 className="text-center text-lg font-semibold">
            Your $CBY for Swap
          </h3>
          <button className="bg-[#adf151] text-[#233010] font-bold text-[16px] leading-[19.2px] px-4 py-3 rounded-[51px]">
            Start New Swap
          </button>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-center justify-center w-1/2">
          <div className="flex justify-center items-center w-[525px] h-[332px] overflow-hidden rounded-[32px] border border-[rgba(255,255,255,0.09)] shadow-[0_4px_18px_rgba(0,0,0,0.25)]">
            <Image
              src="/images/Frame 14.png"
              alt="Connect Wallet"
              width={565}
              height={372}
              className="object-cover"
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
      {/* {popup && <WalletPop setPopup={setpopup} />} */}
    </div>
  );
}

export default Page;
