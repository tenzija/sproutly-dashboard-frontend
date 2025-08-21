"use client";

import PageHeader from "../components/pageHeader/PageHeader";
import LockCard from "./components/LockCard";
import Bridge from "./components/Bridge";
import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import "./Swapportal.scss";

import Image from "next/image";

function page() {
  const [popup, setPopup] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(!false);
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
      <Bridge  isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

export default page;
