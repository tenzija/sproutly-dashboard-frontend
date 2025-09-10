"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { RiSwapBoxFill } from "react-icons/ri";
import { FaWallet } from "react-icons/fa";
import { useAccount, useDisconnect } from "wagmi";
import "./Sidebar.css";
import Image from "next/image";
import { useAppKit } from "@reown/appkit/react";

const sidebarFallback = [
  { name: "Swap Portal", icon: RiSwapBoxFill, href: "/swapportal" },
];

function Sidebar() {
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const { open, close } = useAppKit();
  const { disconnect } = useDisconnect();
  const handleClick = () => {
    if (isConnected) {
      close();
    } else {
      open();
    }
  };
  const handleDisconnect = () => {
    if (isConnected) {
      disconnect();
    }
  };

  return (
    <div className="sidebar glass_card">
      <nav className="sidebar_nav">
        <div className="sidebar_header">
          <Image
            src="/images/button.png"
            alt="Profile"
            width={48}
            height={48}
            className="sidebar_img"
          />
          <p>Rasmy</p>
        </div>

        {!isConnected ? (
          <button onClick={handleClick} className="connect_wallet_btn">
            <FaWallet className="wallet_icon" />
            Connect Wallet
          </button>
        ) : (
          <button onClick={handleDisconnect} className="connect_wallet_btn">
            {address?.slice(0, 6) + "..." + address?.slice(-4)}
            <br />
            disconnect
          </button>
        )}

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
  );
}

export default Sidebar;
