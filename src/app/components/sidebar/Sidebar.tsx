"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaWallet } from "react-icons/fa";
import { useAppKit } from "@reown/appkit/react";
import { useAccount, useDisconnect } from "wagmi";
import Image from "next/image";
import { getCookie } from "@/utils/cookies";
import { useAutoDisconnectOnLock } from "@/hooks/useAutoDisconnectOnLock";
import { Tooltip } from "@mui/material";

type IconComponent = React.ComponentType<{ className?: string }>;

type SidebarItemBase = {
  name: string;
  href: string;
};

type SidebarItemWithComponent = SidebarItemBase & {
  icon: IconComponent;
};

type SidebarItemWithPath = SidebarItemBase & {
  iconPath: string; // e.g. "/images/sidebar/staking.svg"
};

type SidebarItem = SidebarItemWithComponent | SidebarItemWithPath;


const sidebarFallback: SidebarItem[] = [
  { name: "Swap Portal", iconPath: "/images/sidebar/swapportal.svg", href: "/swapportal" },
  { name: "Dashboard", iconPath: "/images/sidebar/dashboard.svg", href: "/dashboard" },
  { name: "NFT Inventory", iconPath: "/images/sidebar/nft-inventory.svg", href: "/nft-inventory" },
  { name: "NFT Cultivation", iconPath: "/images/sidebar/nft-cultivation.svg", href: "/nft-cultivation" },
  { name: "Staking", iconPath: "/images/sidebar/staking.svg", href: "/staking" },
  { name: "Marketplace", iconPath: "/images/sidebar/marketplace.svg", href: "/marketplace" },
  { name: "Governance", iconPath: "/images/sidebar/governance.svg", href: "/governance" },
  { name: "CO2 Management", iconPath: "/images/sidebar/co2.svg", href: "/co2-management" },
  { name: "Referral Program", iconPath: "/images/sidebar/referral-program.svg", href: "/referral-program" },
  { name: "Leaderboard", iconPath: "/images/sidebar/leaderboard.svg", href: "/leaderboard" },
  { name: "Game Hub", iconPath: "/images/sidebar/game-hub.svg", href: "/game-hub" },
];

type SidebarProps = {
  openSidebar: boolean;
  setOpenSidebar: (value: boolean) => void;
  setHeaderName: (value: string) => void;   // <-- add this
};


function Sidebar({ openSidebar, setOpenSidebar, setHeaderName }: SidebarProps) {
  const token = getCookie("authTokens");
  useAutoDisconnectOnLock(2000);

  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const pathname = usePathname();
  const { isConnected, address } = useAccount();
  const { open, close } = useAppKit();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (token) {
      const user = JSON.parse(token).user;
      setUsername(user?.username || "");
      setImage(user?.photoUrl || "");
    }
  }, [token]);

  useEffect(() => {
    const active = sidebarFallback.find(i => i.href === pathname);
    if (active) setHeaderName(active.name);
  }, [pathname, setHeaderName]);

  const onNavClick = (name: string) => {
    setHeaderName(name);
    // close sidebar on mobile overlay
    setOpenSidebar(true); // (your state: true => hidden)
  };

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
  const handleSidebarToggle = () => {
    setOpenSidebar(true);
  };

  const handleImageError = () => {
    setImage("/images/avatar.png"); // Fallback to placeholder image on error
  };

  // Only this route is enabled
  const ENABLED_HREF = ["/swapportal", "/staking"];

  // put this above your component (same file is fine)
  function SvgIcon({ src, className = "" }: { src: string; className?: string }) {
    return (
      <span
        aria-hidden
        className={`inline-block ${className}`}
        style={{
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          backgroundColor: "currentColor", // <- picks up your text/hover colors
        }}
      />
    );
  }



  return (
    <>
      <div
        className={`py-8 top-0 left-0 h-screen w-[263px] border-l border-r p-8 px-6 flex flex-col justify-between ml-0
    bg-[var(--glass-new,#8989890d)] backdrop-blur-[150px] border border-[var(--glass-stroke-new,#ffffff17)]
    shadow-[3px_3px_3px_rgba(0,0,0,0.089)] fixed md:sticky z-50 md:z-auto transition-transform duration-300
    ${openSidebar ? "translate-x-[-100%]" : "translate-x-0"} md:translate-x-0`}
      >
        <nav className="flex flex-col gap-[5px]">
          <div className="flex items-center gap-2 mt-[-1.5px] mb-5">
            <Image
              src={image || "/images/avatar.png"}
              alt="Profile"
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded-[50%]"
              onError={handleImageError}
            />
            <p className="font-semibold ml-2">{username}</p>
          </div>

          {!isConnected ? (
            <button
              onClick={handleClick}
              className="w-full flex items-center justify-center gap-3
               px-4 py-3 mb-[10px] border border-white/10 rounded-4xl
               bg-[#8989890d] text-[color:var(--white-80)]
               font-bold text-base cursor-pointer
               transition-colors duration-300 ease-in-out
               backdrop-blur-[150px]
               hover:bg-[color:var(--Green--80)] hover:text-black"
            >
              <FaWallet className="text-2xl" />
              Connect Wallet
            </button>
          ) : (
            <Tooltip title="Press to disconnect" arrow placement="top">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-3
                px-4 py-3 mb-[10px] border border-white/10 rounded-4xl
                bg-[#8989890d] text-[color:var(--white-80)]
                font-bold text-base cursor-pointer
                transition-colors duration-300 ease-in-out
                backdrop-blur-[150px]
                hover:bg-[color:var(--Green--80)] hover:text-black"
              >
                {address?.slice(0, 6) + "..." + address?.slice(-4)}
              </button>
            </Tooltip>
          )}

          <div className="flex flex-col gap-2 mt-[16px]">
            {sidebarFallback.map((item) => {
              const isActive = pathname === item.href;
              const isEnabled = ENABLED_HREF.includes(item.href);

              const baseClasses =
                "flex items-center px-3 py-2 rounded-lg w-[214px] h-[38px] text-[color:var(--white-60)] transition-colors duration-300 ease-in-out";
              const enabledClasses = `cursor-pointer hover:bg-[#ccf693] hover:text-black ${isActive ? "bg-[color:var(--Green--100)] text-black" : ""
                }`;
              const disabledClasses =
                "cursor-not-allowed opacity-30 hover:bg-[color:var(--white-25)] hover:text-[color:var(--white-60)]";

              if (isEnabled) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="block"              // keep layout identical
                    prefetch={false}
                    onClick={() => {
                      setHeaderName(item.name);    // update header
                      setOpenSidebar(true);        // close sidebar on mobile (your logic: true => hidden)
                    }}
                  >
                    <div className={`${baseClasses} ${enabledClasses}`}>
                      {/* icon */}
                      {"iconPath" in item
                        ? <SvgIcon src={item.iconPath} className="mr-3 h-4 w-4" />
                        : (() => { const Icon = (item).icon; return <Icon className="text-base mr-3" /> })()
                      }

                      <span className="text-md font-light">{item.name}</span>
                    </div>
                  </Link>
                );
              }

              return (
                <Tooltip key={item.name} title="Work in progress!" placement="bottom" arrow>
                  <div role="button" aria-disabled="true" tabIndex={-1} className={`${baseClasses} ${disabledClasses}`}>
                    {"iconPath" in item
                      ? <SvgIcon src={item.iconPath} className="mr-3 h-4 w-4" />
                      : (() => { const Icon = (item).icon; return <Icon className="text-base mr-3" /> })()
                    }
                    <span className="text-md font-light">{item.name}</span>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </nav>
        <Image
          src="/images/logo-cropped.png"
          alt="Sproutly Logo"
          width={300}
          height={300}
        />
      </div>
      {!openSidebar && (
        <label
          onClick={() => handleSidebarToggle()}
          className="fixed inset-0 bg-black/30 z-40 max-md:flex hidden"
        ></label>
      )}
    </>
  );
}

export default Sidebar;
