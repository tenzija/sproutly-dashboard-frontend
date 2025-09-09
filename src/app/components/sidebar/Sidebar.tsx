"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaHandHolding } from "react-icons/fa";
import { BsBarChartFill } from "react-icons/bs";
import { IoBagHandle } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { IoGameController } from "react-icons/io5";
import { MdCo2 } from "react-icons/md";
import { IoGift } from "react-icons/io5";
import { PiGavelFill } from "react-icons/pi";
import { RiTreeFill } from "react-icons/ri";
import { RiNftFill } from "react-icons/ri";
import { RiSwapBoxFill } from "react-icons/ri";
import { FaWallet } from "react-icons/fa";
import { useAccount, useDisconnect } from "wagmi";
import "./Sidebar.css";
import Image from "next/image";
import { useAppKit } from "@reown/appkit/react";

const sidebarFallback = [
  { name: "Dashboard", icon: MdDashboard, href: "/dashboard" },
  { name: "NFT Inventory", icon: RiNftFill, href: "/nftinventory" },
  { name: "NFTree Cultivation", icon: RiTreeFill, href: "/mynfts" },
  { name: "Staking", icon: FaHandHolding, href: "/staking" },
  { name: "Market Place", icon: IoBagHandle, href: "/marketplace" },
  { name: "Governance (DAO)", icon: PiGavelFill, href: "/governance" },
  { name: "Swap Portal", icon: RiSwapBoxFill, href: "/swapportal" },
  { name: "CO₂ Management", icon: MdCo2, href: "/copools" },
  { name: "Referral Program", icon: IoGift, href: "/referralprogram" },
  { name: "Leaderboard", icon: BsBarChartFill, href: "/leaderboard" },
  { name: "Game hub", icon: IoGameController, href: "/gamehub" },
];

function Sidebar() {
  // const [sidebarItems, setSidebarItems] = useState([]);
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
            src="/images/sidebarimg.jpg"
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
