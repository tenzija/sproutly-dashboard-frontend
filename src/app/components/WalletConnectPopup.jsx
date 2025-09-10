"use client";

import React from "react";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import "./WalletConnectPopup.css";

function WalletConnectPopup({ 
  isOpen, 
  onClose, 
  onWalletConnect, 
  title = "Connect Your Wallet",
  showHelpLinks = true 
}) {
  if (!isOpen) return null;

  const handleWalletConnect = (walletType) => {
    onWalletConnect(walletType);
  };

  return (
    <div className="wallet_connect_popup">
      <div className="wallet_connect_popup_content">
        <div className="popup_close" onClick={onClose}>
          <IoClose />
        </div>
        <div className="wallet_popup">
          <p className="wallet_popup_title">{title}</p>
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
          {showHelpLinks && (
            <div className="wallet_help_links">
              <p className="wallet_help_link">What is a Web3 Wallet?</p>
              <p className="wallet_help_link">Having trouble connecting?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletConnectPopup;
