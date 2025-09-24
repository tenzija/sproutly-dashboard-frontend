"use client";

// import PageHeader from "../components/pageHeader/PageHeader";
import LockCard from "./components/LockCard";
import Bridge from "./components/Bridge";
import Image from "next/image";
import { useAccount, useReadContract } from "wagmi";
import React, { useState, useEffect } from "react";
import { CBY_ABI } from "@/constant/BlockchainConstants";
import "./Swapportal.scss";
import { formatThousands, formatToken } from "@/utils/helper";
import { useAppKit } from "@reown/appkit/react";


const NEXT_PUBLIC_CBY_ADDRESS = process.env.NEXT_PUBLIC_CBY_ADDRESS;
const NEXT_PUBLIC_CBY_DECIMALS = Number(process.env.NEXT_PUBLIC_CBY_DECIMALS) || 18;
function SwapPortalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address: currentAddress, isConnected } = useAccount();
  const { open, close } = useAppKit();
  const handleClick = () => {
    if (isConnected) {
      close();
    } else {
      open();
    }
  };


  const [value, setValue] = useState<string>("0.00");
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
  if (!isConnected) {
    return (
      <div className="swap_portals">
        {/* <PageHeader title="Swap Portal" showSearch={false} showButton={false} showBalance={true} /> */}
        <div className="swap_connect_container glass_card">
          <Image
            src="/images/ConnectWallet.png"
            alt="Connect Wallet"
            width={144}
            height={144}
            className="swap_wallet_image"
          />
          <p className="swap_connect_title">Connect Your Wallet to Begin</p>
          <p className="swap_connect_subtitle">
            To access the Swap Portal and start exchanging your $CBY for $SEED, please connect your Web3 wallet
          </p>
          <button className="swap_connect_btn" onClick={handleClick}>
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
      </div>
    );
  }

  return (
    <div className="swap_portals">
      {/* <PageHeader title="Swap Portal" showSearch={false} showButton={false} showBalance={true} /> */}
      <div className="swap_top">
        <div className="left">
          <h2>Ready to Grow Your SEED?</h2>
          <p>
            Swap your $CBY for $SEED tokens and earn more with longer lock-up
            periods. Your tokens on the BASE chain are ready for action.
          </p>
          <div className="available">
            <p>Available $CBY Balance</p>
            <div className="balance">
              <h1>
                {formatThousands(value)}
              </h1>
              <h2>$CBY</h2>
            </div>
            <p>In Base Chain</p>
          </div>
          <h3>Your $CBY for Swap</h3>
          <button onClick={handleStartSwap}>Start New Swap </button>
        </div>
        <div className="right">
          <div className="image">
            <Image
              src="/images/Frame 14.png"
              alt="Connect Wallet"
              width={144}
              height={144}
              className="swap_wallet_image"
            />
          </div>
        </div>
      </div>
      <div className="active_lock">
        <h3>Your Active Locks</h3>
        <div className="lock_grid">
          <LockCard />
          <LockCard />
          <LockCard />
          <LockCard />
        </div>
      </div>
      <Bridge isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Reusable Wallet Connection Popup - Always rendered */}
      {/* <WalletConnectPopup
        isOpen={popup}
        onClose={() => setPopup(false)}
        onWalletConnect={handleWalletConnect}
        title="Connect Your Wallet"
        showHelpLinks={true}
      /> */}
    </div>
  );
}

export default SwapPortalPage;
