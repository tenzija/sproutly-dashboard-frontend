"use client";

import PageHeader from "../components/pageHeader/PageHeader";
import LockCard from "./components/LockCard";
import Bridge from "./components/Bridge";
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import "./Swapportal.scss";

import Image from "next/image";

function SwapPortalPage() {
  const [popup, setPopup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleStartSwap = () => {
    setIsModalOpen(true);
  };

  const handleWalletConnect = (walletType) => {
    setIsWalletConnected(true);
    setPopup(false);
  };

  const handleConnectWalletClick = () => {
    setPopup(true);
  };

  if (!isWalletConnected) {
    return (
      <div className="swap_portals">
        <PageHeader title="Swap Portal" showSearch={false} showButton={false} />
        <div className="connect-wallet-container">
          <div className="connect-wallet-content">
            <div className="wallet-image">
              <Image
                src="/images/Frame 14.png"
                alt="Connect Wallet"
                width={200}
                height={200}
                className="connect-wallet-img"
              />
            </div>
            <h1 className="connect-wallet-title">Connect Your Wallet to Begin</h1>
            <p className="connect-wallet-description">
              To access the Swap Portal and start exchanging your $CBY for $SEED, please connect your Web3 wallet.
            </p>
            <button 
              className="connect-wallet-btn"
              onClick={handleConnectWalletClick}
            >
              Connect Wallet
            </button>
          </div>
        </div>
        {popup && (
          <div className="swap_popup">
            <div className="swap_popup_content">
              <div className="popup_close" onClick={() => setPopup(false)}>
                <IoClose />
              </div>
              <div className="wallet_popup">
                <p className="wallet_popup_title">Connect Your Wallet</p>
                <div className="wallet_options">
                  <button 
                    className="wallet_option_btn matamask"
                    onClick={() => handleWalletConnect('metamask')}
                  >
                    <Image
                      src="/images/metamask.png"
                      alt="Metamask"
                      width={26}
                      height={24}
                      className="wallet_option_img"
                    />
                    Metamask
                  </button>
                  <button 
                    className="wallet_option_btn rabby"
                    onClick={() => handleWalletConnect('rabby')}
                  >
                    <Image
                      src="/images/rabby.png"
                      alt="Rabby Wallet"
                      width={24}
                      height={24}
                      className="wallet_option_img"
                    />
                    Rabby Wallet
                  </button>
                  <button 
                    className="wallet_option_btn wallet"
                    onClick={() => handleWalletConnect('walletconnect')}
                  >
                    <Image
                      src="/images/wallet.png"
                      alt="WalletConnect"
                      width={24}
                      height={24}
                      className="wallet_option_img"
                    />
                    WalletConnect
                  </button>
                </div>
                <div className="wallet_help_links">
                  <p className="wallet_help_link">What is a Web3 Wallet?</p>
                  <p className="wallet_help_link">Having trouble connecting?</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show main portal page after wallet connection
  return (
    <div className="swap_portals">
      <PageHeader title="Swap Portal" showSearch={false} showButton={false} />
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
        <h3>Active Lock</h3>
        <div className="lock_grid">
          <LockCard />
          <LockCard />
          <LockCard />
          <LockCard />
        </div>
      </div>
      <Bridge isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default SwapPortalPage;
