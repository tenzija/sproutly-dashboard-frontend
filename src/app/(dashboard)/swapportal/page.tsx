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
import { useActiveLocks } from "@/hooks/useActiveLocks";
import LockCardFromSchedule from "./components/LockCardFromSchedule";
import { Skeleton } from '@mui/material';

const NEXT_PUBLIC_CBY_ADDRESS = process.env.NEXT_PUBLIC_CBY_ADDRESS;
const NEXT_PUBLIC_CBY_DECIMALS = Number(process.env.NEXT_PUBLIC_CBY_DECIMALS) || 18;
const VESTING_ADDR = process.env.NEXT_PUBLIC_TOKEN_VESTING_ADDRESS;

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
  const { data, isPending, isFetching, } = useReadContract({
    address: NEXT_PUBLIC_CBY_ADDRESS as `0x${string}`,
    abi: CBY_ABI,
    functionName: "balanceOf",
    args: [currentAddress],
    // Don’t run until wallet is connected & we have an address
    query: { enabled: Boolean(isConnected && currentAddress) },
  });

  const { locks, isLoading } = useActiveLocks({
    vestingAddress: VESTING_ADDR as `0x${string}`,
    tokenDecimals: 18,
  });

  console.log("locks", locks);

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
          {/* <button className="swap_connect_btn" onClick={handleClick}>
            Connect Wallet
          </button> */}
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
                {(isPending || isFetching)
                  ? (
                    <Skeleton
                      variant="text"
                      width={90}
                      sx={{ fontSize: '2.5rem', lineHeight: 1 }}
                    />
                  )
                  : formatThousands(value)
                }
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
              width={1080}           // intrinsic pixels
              height={1080}
              quality={100}
              className="swap_wallet_image"

            />
          </div>
        </div>
      </div>
      <div className="active_lock">
        <h3>Your Active Locks</h3>
        <div className="lock_grid">
          {locks.map((item, idx) => (
            <LockCardFromSchedule
              key={`${item.id}-${idx}`}
              item={item}
              vestingAddress={VESTING_ADDR as `0x${string}`}
            // onClaim={(id) => {
            //   // call your release hook here (e.g., writeContract to `release(bytes32 id)`)
            // }}
            />
          ))}
        </div>
      </div>
      <Bridge isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} availableBalance={value} />

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
