"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { RiSwapBoxFill } from "react-icons/ri";
import { FaWallet } from "react-icons/fa";
import WalletConnectPopup from "../WalletConnectPopup";

import "./Sidebar.css";
import Image from "next/image";

const sidebarFallback = [
  { name: "Swap Portal", icon: RiSwapBoxFill, href: "/swapportal" },
];

function Sidebar() {
  const pathname = usePathname();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  useEffect(() => {
    const walletStatus = sessionStorage.getItem('walletConnected');
    if (walletStatus === 'true') {
      setIsWalletConnected(true);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'walletConnected') {
        if (e.newValue === 'true') {
          setIsWalletConnected(true);
        } else {
          setIsWalletConnected(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const handleCustomStorageChange = (e) => {
      if (e.detail.key === 'walletConnected') {
        if (e.detail.newValue === 'true') {
          setIsWalletConnected(true);
        } else {
          setIsWalletConnected(false);
        }
      }
    };

    window.addEventListener('sessionStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionStorageChange', handleCustomStorageChange);
    };
  }, []);

  const handleConnectWalletClick = () => {
    setShowWalletPopup(true);
  };

  const handleWalletConnect = (walletType) => {
    setIsWalletConnected(true);
    sessionStorage.setItem('walletConnected', 'true');
    sessionStorage.setItem('walletType', walletType);
    
    window.dispatchEvent(new CustomEvent('sessionStorageChange', {
      detail: { key: 'walletConnected', newValue: 'true' }
    }));
    
    setShowWalletPopup(false);
    
    window.location.reload();
  };

  const handleClosePopup = () => {
    setShowWalletPopup(false);
  };

  return (
    <>
      <div className="sidebar glass_card">
        <nav className="sidebar_nav">
          <div className="sidebar_header">
            <Image
              src="/images/sidebarimg.jpg"
              alt="Profile"
              width={48}
              height={48}
              className="sidebar_img"
            />
            <p>Rasmy</p>
          </div>

          <button 
            className="connect_wallet_btn"
            onClick={handleConnectWalletClick}
          >
            <FaWallet className="wallet_icon" />
            {isWalletConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>

          <div className="sidebarFallback">
            {sidebarFallback.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`sidebar_item ${isActive ? "active" : ""}`}>
                    <Icon className="sidebar_icon" />
                    <span className="sidebar_text">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <WalletConnectPopup
        isOpen={showWalletPopup}
        onClose={handleClosePopup}
        onWalletConnect={handleWalletConnect}
        title="Connect Your Wallet"
        showHelpLinks={true}
      />
    </>
  );
}

export default Sidebar;
