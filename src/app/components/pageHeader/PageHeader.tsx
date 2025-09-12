"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./PageHeader.css";
import { FaWallet } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { useAccount, useDisconnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
interface PageHeaderProps {
  title: string;
  showSearch?: boolean;
}
function PageHeader({ title, showSearch = true }: PageHeaderProps) {
  const { logout } = useAuth();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  const { open, close } = useAppKit();
  const handleClick = () => {
    if (isConnected) {
      close();
    } else {
      open();
    }
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [settingsPosition, setSettingsPosition] = useState({
    top: 0,
    right: 0,
  });

  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsPopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node) &&
        !settingsPopRef.current
      ) {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const calculateSettingsPosition = (
    ref: React.RefObject<HTMLDivElement | null>
  ) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      };
    }
    return { top: 0, right: 0 };
  };

  const toggleSettings = () => {
    const newState = !isSettingsOpen;
    setIsSettingsOpen(newState);
    if (newState) {
      setSettingsPosition(calculateSettingsPosition(settingsRef));
    }
  };
  const handleLogout = () => {
    logout();
    if (isConnected) {
      disconnect();
    }
    redirect("/login");
  };

  const renderSettingsDropdown = () => {
    if (!isSettingsOpen) return null;

    const dropdownContent = (
      <div
        className="settings_dropdown"
        style={{
          position: "fixed",
          top: `${settingsPosition.top}px`,
          right: `${settingsPosition.right}px`,
          zIndex: 9999999,
        }}
        ref={settingsPopRef}
      >
        <button className="settings_item" onClick={() => handleLogout()}>
          <span>Logout</span>
        </button>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div
      className="flex items-center justify-between h-20 flex-grow rounded-[59px] px-8 py-4 
                max-md:flex-col max-md:h-auto max-md:gap-4 max-md:p-4 bg-[var(--glass-new,#8989890d)] backdrop-blur-[150px] border border-[var(--glass-stroke-new,#ffffff17)] shadow-[3px_3px_3px_rgba(0,0,0,0.089)]"
    >
      <div>
        <p className="text-xl md:text-2xl font-bold">{title}</p>
      </div>

      {showSearch && (
        <div className="pageheader_searchicon">
          <input
            type="text"
            className="pageheader_input"
            placeholder="Search Box"
          />
          <IoMdSearch className="pageheader_icon" />
        </div>
      )}

      <div className="right_element">
        {!isConnected && (
          <button onClick={() => handleClick()}>
            <FaWallet />
            Connect wallet
          </button>
        )}

        <div
          className="svgimg settings_icon"
          ref={settingsRef}
          onClick={toggleSettings}
        >
          <IoSettingsOutline />
        {renderSettingsDropdown()}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
