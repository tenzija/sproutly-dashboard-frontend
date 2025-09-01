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

import "./Sidebar.css";
import Image from "next/image";

const sidebarFallback = [
  { name: "Swap Portal", icon: RiSwapBoxFill, href: "/swapportal" },
];

function Sidebar() {
  // const [sidebarItems, setSidebarItems] = useState([]);
  const pathname = usePathname();

  // useEffect(() => {
  //     setSidebarItems(sidebarFallback);
  // }, []);

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

        <button className="connect_wallet_btn">
          <FaWallet className="wallet_icon" />
          Connect Wallet
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
  );
}

export default Sidebar;
