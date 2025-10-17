"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { IoSettingsOutline } from "react-icons/io5";
import { useAccount, useDisconnect } from "wagmi";
import { useAuth } from "@/context/AuthContext";
import { GiHamburgerMenu } from "react-icons/gi";
type PageHeaderProps = {
  openSidebar: boolean;
  setOpenSidebar: (value: boolean) => void;
  headerName: string;
};

function PageHeader({ openSidebar, setOpenSidebar, headerName }: PageHeaderProps) {
  const { logout } = useAuth();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
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
    if (isConnected) {
      disconnect();
    }
    logout();
  };
  const handleSidebarToggle = () => {
    setOpenSidebar(!openSidebar);
  };
  const renderSettingsDropdown = () => {
    if (!isSettingsOpen) return null;

    const dropdownContent = (
      <div
        className="absolute top-full right-0 mt-2 bg-[var(--glass-new,#8989890d)] border border-[var(--glass-stroke-new,#ffffff17)] rounded-[12px] p-0 min-w-[200px] z-[999999] backdrop-blur-[150px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden animate-[dropdownFadeIn_0.2s_ease-out]"
        style={{
          position: "fixed",
          top: `${settingsPosition.top}px`,
          right: `${settingsPosition.right}px`,
          zIndex: 9999999,
        }}
        ref={settingsPopRef}
      >
        <button
          className="w-full px-4 py-3 text-[var(--white-100)] text-sm font-normal cursor-pointer transition-colors duration-200 ease-in-out border-b border-white/10 hover:bg-white/5 last:border-b-0 last:text-[#ff6b6b]"
          onClick={() => handleLogout()}
        >
          <span>Logout</span>
        </button>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div className="flex items-center justify-between h-20 flex-grow rounded-[59px] px-8 py-4 max-md:h-auto max-md:gap-4 max-md:p-4 bg-[var(--glass-new,#8989890d)] backdrop-blur-[150px] border border-[var(--glass-stroke-new,#ffffff17)] shadow-[3px_3px_3px_rgba(0,0,0,0.089)]">
      <div className="flex items-center gap-4">
        <button className="max-md:flex hidden items-center justify-center" onClick={handleSidebarToggle}>
          <GiHamburgerMenu className="text-2xl" />
        </button>
        <p className="text-xl md:text-2xl font-bold">{headerName}</p>
      </div>

      <div className="right_element">
        <div
          className="flex items-center justify-center bg-[var(--white-50)] backdrop-blur-md rounded-[58px] h-12 w-12 text-[20px] cursor-pointer transition-colors duration-300 ease-in-out  relative z-[10000]"
          ref={settingsRef}
          onClick={toggleSettings}
        >
          <IoSettingsOutline className="h-8 w-8 text-[var(--white-100)]" />
          {renderSettingsDropdown()}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
