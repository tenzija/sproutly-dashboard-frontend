"use client";

import PageHeader from "../components/pageHeader/PageHeader";
import LockCard from "./components/LockCard";
import Bridge from "./components/Bridge";
import React, { useEffect, useState } from "react";
import "./Swapportal.scss";

import Image from "next/image";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import WalletPop from "../components/walletconnect/WalletPop";
import {
  useAppKitAccount,
  useAppKitProvider,
  useAppKitNetworkCore,
  type Provider,
} from "@reown/appkit/react";
import {
  BrowserProvider,
  JsonRpcSigner,
  formatEther,
  parseUnits,
} from "ethers";
function page() {
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
  // const { address, isConnected } = useAppKitAccount();
  // function to get the balance

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
      <div className="swap_portals">
        <PageHeader
          title="Swap Portal"
          showSearch={false}
          showButton={false}
          showBalance={false}
        />
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
            To access the Swap Portal and start exchanging your $CBY for $SEED,
            please connect your Web3 wallet
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
        {/* {popup && <WalletPop setPopup={setpopup} />} */}
      </div>
    );
  }
  return (
    <div className="swap_portals">
      <PageHeader title="Swap Portal" showSearch={false} showButton={true} />
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
              <h1>{balance}</h1>
              <h2>$CBY</h2>
            </div>
            <p>In Base Chain</p>
          </div>
          <h3>Your $CBY for Swap</h3>
          <button>Start New Swap </button>
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
        <h3>Active Lock</h3>
        <div className="lock_grid">
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

export default page;
