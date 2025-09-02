"use client";

import PageHeader from "../components/pageHeader/PageHeader";
import LockCard from "./components/LockCard";
import Bridge from "./components/Bridge";
import WalletConnectPopup from "../components/WalletConnectPopup";
import React, { useState, useEffect } from "react";
import "./Swapportal.scss";

import Image from "next/image";

function SwapPortalPage() {
  const [popup, setPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    const walletStatus = sessionStorage.getItem('walletConnected');
    if (walletStatus === 'true') {
      setIsWalletConnected(true);
    }
  }, []);

  const handleStartSwap = () => {
    setIsModalOpen(true);
  };

  const handleWalletConnect = (walletType) => {
    setIsWalletConnected(true);
    sessionStorage.setItem('walletConnected', 'true');
    sessionStorage.setItem('walletType', walletType);
    
    window.dispatchEvent(new CustomEvent('sessionStorageChange', {
      detail: { key: 'walletConnected', newValue: 'true' }
    }));
    
    setPopup(false);
  };

  const handleConnectWalletClick = () => {
    setPopup(true);
    setIsModalOpen(false);
  };

  if (!isWalletConnected) {
    return (
      <div className="swap_portals">
        <PageHeader title="Swap Portal" showSearch={false} showButton={false} showBalance={true} />
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
          <button className="swap_connect_btn" onClick={handleConnectWalletClick}>
            Connect Wallet
          </button>
        </div>
        
        {/* Reusable Wallet Connection Popup */}
        <WalletConnectPopup
          isOpen={popup}
          onClose={() => setPopup(false)}
          onWalletConnect={handleWalletConnect}
          title="Connect Your Wallet"
          showHelpLinks={true}
        />
      </div>
    );
  }

  return (
    <div className="swap_portals">
      <PageHeader title="Swap Portal" showSearch={false} showButton={false} showBalance={true} />
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
              <h1>14,950</h1>
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
      <Bridge isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} handleConnectWallet={handleConnectWalletClick} />
      
      {/* Reusable Wallet Connection Popup - Always rendered */}
      <WalletConnectPopup
        isOpen={popup}
        onClose={() => setPopup(false)}
        onWalletConnect={handleWalletConnect}
        title="Connect Your Wallet"
        showHelpLinks={true}
      />
    </div>
  );
}

export default SwapPortalPage;
