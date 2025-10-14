"use client";

// import PageHeader from "../components/pageHeader/PageHeader";
import Bridge from "./components/Bridge";
import Image from "next/image";
import { useAccount, useReadContract } from "wagmi";
import React, { useState, useEffect } from "react";
import { CBY_ABI } from "@/constant/BlockchainConstants";
import "./Swapportal.scss";
import { formatThousands, formatToken } from "@/utils/helper";
// import { useAppKit } from "@reown/appkit/react";
import { useActiveLocks, VestingSchedule } from "@/hooks/useActiveLocks";
import LockCardFromSchedule from "./components/LockCardFromSchedule";
import { Skeleton } from '@mui/material';
import { LockCardSkeleton } from "./skeleton/LockCardSkeleton";
import { Hex } from "viem";

const NEXT_PUBLIC_CBY_ADDRESS = process.env.NEXT_PUBLIC_CBY_ADDRESS;
const NEXT_PUBLIC_MOCK_TOKEN = process.env.NEXT_PUBLIC_MOCK_TOKEN;
const NEXT_PUBLIC_CBY_DECIMALS = Number(process.env.NEXT_PUBLIC_CBY_DECIMALS) || 18;
const VESTING_ADDR = process.env.NEXT_PUBLIC_TOKEN_VESTING_ADDRESS;

type LockItem = {
  index: number; // The actual index from the contract
  id: Hex;
  raw: VestingSchedule;
  claimableFormatted: string;
  totalFormatted: string;
  lockedFormatted: string;
  timeRemainingText: string;
  unlockDateText: string;
  progressPct: number;
  claimableRaw: bigint;
}

function SwapPortalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { address: currentAddress, isConnected } = useAccount();

  const [value, setValue] = useState<string>("0.00");
  const [polygonValue, setPolygonValue] = useState<string>("0.00");
  const [lockData, setLockData] = useState<LockItem[]>([]); // Define the type of lockData state
  const { data, isPending, isFetching, refetch: refetchCBYBalance } = useReadContract({
    address: NEXT_PUBLIC_CBY_ADDRESS as `0x${string}`,
    abi: CBY_ABI,
    functionName: "balanceOf",
    args: [currentAddress],
    // Don’t run until wallet is connected & we have an address
    query: { enabled: Boolean(isConnected && currentAddress) },
    chainId: 8453, // BASE Mainnet
  });

  const { locks, isLoading: isLoadingLocks } = useActiveLocks({
    vestingAddress: VESTING_ADDR as `0x${string}`,
    tokenDecimals: 18,
  });

  useEffect(() => {
    setLockData(locks); // Update lockData whenever locks change
  }, [locks]);

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

  const { data: polygonData, isPending: isPendingPolygon, isFetching: isFetchingPolygon, refetch: refetchPolCBYBalance } = useReadContract({
    address: NEXT_PUBLIC_MOCK_TOKEN as `0x${string}`,
    abi: CBY_ABI,
    functionName: "balanceOf",
    args: [currentAddress],
    // Don’t run until wallet is connected & we have an address
    query: { enabled: Boolean(isConnected && currentAddress) },
    chainId: 137, // BASE Mainnet
  });

  useEffect(() => {
    const getData = async () => {
      await polygonData;
      if (polygonData !== undefined) {
        const ethValue = formatToken(polygonData as bigint, NEXT_PUBLIC_CBY_DECIMALS);
        setPolygonValue(ethValue);
      }
    };
    getData().catch(console.error);
  }, [polygonData]);

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
          <h2 className="font-semibold">Ready to Grow Your $SEED?</h2>
          <p>
            Swap your $CBY for $SEED tokens and earn more $SEED with longer lock-up
            periods. Below is your available $CBY on both BASE and Polygon chains.
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <div className="available">
              <p>Available $CBY Balance</p>
              <div className="balance">
                <h1>
                  {(isPendingPolygon || isFetchingPolygon)
                    ? (
                      <Skeleton
                        variant="text"
                        width={90}
                        sx={{ fontSize: '2.5rem', lineHeight: 1 }}
                      />
                    )
                    : formatThousands(polygonValue)
                  }
                </h1>
                <h2>$CBY</h2>
              </div>
              <div className="flex items-center gap-1">
                <p>On Polygon Chain</p>
                <Image
                  src="/images/polygon-logo.png" // Replace with your path or URL
                  alt="Polygon Logo"
                  width={20}
                  height={20}
                  className="inline"
                />
              </div>
            </div>

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
              <div className="flex items-center gap-1">
                <p>On BASE Chain</p>
                <Image
                  src="/images/base-logo.svg" // Replace with your path or URL
                  alt="BASE Logo"
                  width={20}
                  height={20}
                  className="inline"
                />
              </div>
            </div>
          </div>

          <h3 className="text-sm text-center">By pressing the button below you will start the swap process, which includes bridging $CBY from Polygon to BASE, after which you will be able to vest your $CBY for $SEED.</h3>
          <button className="success-card__button" onClick={handleStartSwap}>Start New Swap</button>
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
          {/* <LockCardSkeleton /> */}
          {isLoadingLocks ? (
            <LockCardSkeleton />
          ) :
            lockData
              .filter((item) => item !== null)
              .map((item, idx) => (
                <LockCardFromSchedule
                  key={`${item!.id}-${idx}`}
                  item={item!}
                  index={idx}
                  vestingAddress={VESTING_ADDR as `0x${string}`}
                />
              ))}
        </div>
      </div>
      <Bridge isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} availableBalance={value} onSuccess={async () => {
        await refetchCBYBalance();
        await refetchPolCBYBalance();
      }} />

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
