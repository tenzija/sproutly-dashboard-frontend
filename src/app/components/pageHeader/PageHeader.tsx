"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./PageHeader.css";
import { FaWallet } from "react-icons/fa";
import { TbWorld } from "react-icons/tb";
import { IoMdNotificationsOutline, IoMdSearch } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import { useAccount } from "wagmi";
import {
  useAppKitAccount,
  useAppKitProvider,
  useAppKitNetworkCore,
  type Provider,
  useAppKit,
} from "@reown/appkit/react";
import {
  BrowserProvider,
  JsonRpcSigner,
  formatEther,
  parseUnits,
} from "ethers";
function PageHeader({
  title,
  showSearch = true,
  showButton = true,
  buttonText = "Connect wallet",
  buttonIcon = <FaWallet />,
  showBalance = false,
}:any) {
    const { address, isConnected } = useAccount();
    const { chainId } = useAppKitNetworkCore();
    // AppKit hook to get the wallet provider
    const { walletProvider } = useAppKitProvider<Provider>("eip155");
    const { open, close } = useAppKit();
    const handleClick = () => {
    if (isConnected) {
      close();
    } else {
      open();
    }
  };
  const [isBalanceDropdownOpen, setIsBalanceDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [notificationPosition, setNotificationPosition] = useState({ top: 0, right: 0 });
  const [settingsPosition, setSettingsPosition] = useState({ top: 0, right: 0 });
const balanceRef = useRef<HTMLDivElement>(null);
const notificationRef = useRef<HTMLDivElement>(null);
const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event:any) {
      if (balanceRef.current && !balanceRef.current.contains(event.target)) {
        setIsBalanceDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
    const [balance, setbalance] = useState("0.0000");
  
  useEffect(() => {
    const fetchBalance = async () => {
      if (!walletProvider || !address || !chainId) return;
      try {
        const provider = new BrowserProvider(walletProvider, chainId);
        const balance = await provider.getBalance(address);
        const eth = formatEther(balance);
        console.log(`${eth} ETH`);

        setbalance(parseFloat(eth).toFixed(4));
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };

    fetchBalance();
  }, [address, walletProvider, chainId]);
  const calculateDropdownPosition = (ref :any) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + (rect.width / 2) - 110, // Center the dropdown (220px width / 2)
      };
    }
    return { top: 0, left: 0 };
  };

  const calculateNotificationPosition = (ref :any) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      };
    }
    return { top: 0, right: 0 };
  };

  const calculateSettingsPosition = (ref :any) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      return {
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      };
    }
    return { top: 0, right: 0 };
  };

  const toggleBalanceDropdown = () => {
    const newState = !isBalanceDropdownOpen;
    setIsBalanceDropdownOpen(newState);
    if (newState) {
      setDropdownPosition(calculateDropdownPosition(balanceRef));
    }
    // Close other dropdowns
    setIsNotificationsOpen(false);
    setIsSettingsOpen(false);
  };

  const toggleNotifications = () => {
    const newState = !isNotificationsOpen;
    setIsNotificationsOpen(newState);
    if (newState) {
      setNotificationPosition(calculateNotificationPosition(notificationRef));
    }
    setIsBalanceDropdownOpen(false);
    setIsSettingsOpen(false);
  };

  const toggleSettings = () => {
    const newState = !isSettingsOpen;
    setIsSettingsOpen(newState);
    if (newState) {
      setSettingsPosition(calculateSettingsPosition(settingsRef));
    }
    setIsBalanceDropdownOpen(false);
    setIsNotificationsOpen(false);
  };

  const renderBalanceDropdown = () => {
    if (!isBalanceDropdownOpen) return null;

    const dropdownContent = (
      <div 
        className="balance_dropdown_content"
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          zIndex: 9999999
        }}
      >
        <div className="balance_item">
          <span className="balance_label">Available Balance</span>
          <span className="balance_amount">{balance} $CBY</span>
        </div>
        <div className="balance_item">
          <span className="balance_label">Locked Balance</span>
          <span className="balance_amount">{balance} $CBY</span>
        </div>
        <div className="balance_item">
          <span className="balance_label">Total Balance</span>
          <span className="balance_amount">{balance} $CBY</span>
        </div>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  const renderNotificationDropdown = () => {
    if (!isNotificationsOpen) return null;

    const dropdownContent = (
      <div 
        className="notification_dropdown"
        style={{
          position: 'fixed',
          top: `${notificationPosition.top}px`,
          right: `${notificationPosition.right}px`,
          zIndex: 9999999
        }}
      >
        <div className="notification_header">
          <h4>Notifications</h4>
        </div>
        <div className="notification_item">
          <span className="notification_text">New $SEED tokens available for claim</span>
          <span className="notification_time">2 min ago</span>
        </div>
        <div className="notification_item">
          <span className="notification_text">Lock period completed for #001</span>
          <span className="notification_time">1 hour ago</span>
        </div>
        <div className="notification_item">
          <span className="notification_text">Bridge transaction confirmed</span>
          <span className="notification_time">3 hours ago</span>
        </div>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  const renderSettingsDropdown = () => {
    if (!isSettingsOpen) return null;

    const dropdownContent = (
      <div 
        className="settings_dropdown"
        style={{
          position: 'fixed',
          top: `${settingsPosition.top}px`,
          right: `${settingsPosition.right}px`,
          zIndex: 9999999
        }}
      >
        <div className="settings_header">
          <h4>Settings</h4>
        </div>
        <div className="settings_item">
          <span>Profile Settings</span>
        </div>
        <div className="settings_item">
          <span>Wallet Settings</span>
        </div>
        <div className="settings_item">
          <span>Notification Preferences</span>
        </div>
        <div className="settings_item">
          <span>Security Settings</span>
        </div>
        <div className="settings_item">
          <span>Logout</span>
        </div>
      </div>
    );

    return createPortal(dropdownContent, document.body);
  };

  return (
    <div className="pageheader glass_card">
      <div className="elementName">
        <p>{title}</p>
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
        {isConnected && (
          <div className="balance_section" ref={balanceRef}>
            <div className="balance_dropdown" onClick={toggleBalanceDropdown}>
              <span className="balance_text">Balance</span>
              <span className="balance_amount">{balance}$CBY</span>
              <IoChevronDown className={`balance_arrow ${isBalanceDropdownOpen ? 'rotated' : ''}`} />
            </div>
            {renderBalanceDropdown()}
          </div>
        )}

        {!isConnected && (
          <button onClick={() => handleClick()}>
            {buttonIcon}
            Connect wallet
          </button>
        )}
        
        <div className="svgimg">
          <TbWorld />
        </div>
        
        <div className="svgimg notification_icon" ref={notificationRef} onClick={toggleNotifications}>
          <IoMdNotificationsOutline />
        </div>
        {renderNotificationDropdown()}
        
        <div className="svgimg settings_icon" ref={settingsRef} onClick={toggleSettings}>
          <IoSettingsOutline />
        </div>
        {renderSettingsDropdown()}
      </div>
    </div>
  );
}

export default PageHeader;
