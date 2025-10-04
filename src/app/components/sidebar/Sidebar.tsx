"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { RiSwapBoxFill } from "react-icons/ri";
import { FaWallet } from "react-icons/fa";
import { useAccount, useDisconnect } from "wagmi";
import Image from "next/image";
import { useAppKit } from "@reown/appkit/react";
import { getCookie } from "@/utils/cookies";
import { useAutoDisconnectOnLock } from "@/hooks/useAutoDisconnectOnLock";

const sidebarFallback = [
  { name: "Swap Portal", icon: RiSwapBoxFill, href: "/swapportal" },
];
type SidebarProps = {
  openSidebar: boolean;
  setOpenSidebar: (value: boolean) => void;
};

function Sidebar({ openSidebar, setOpenSidebar }: SidebarProps) {
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


  return (
    <>
      <div
        className={`py-8 top-0 left-0 h-screen w-[263px] border-l border-r p-8 px-6 flex flex-col ml-0
    bg-[var(--glass-new,#8989890d)] backdrop-blur-[150px] border border-[var(--glass-stroke-new,#ffffff17)]
    shadow-[3px_3px_3px_rgba(0,0,0,0.089)] fixed md:sticky z-50 md:z-auto transition-transform duration-300
    ${openSidebar ? 'translate-x-[-100%]' : 'translate-x-0'} md:translate-x-0`}
      >


        <nav className="flex flex-col gap-[5px]">
          <div className="flex items-center gap-2 mt-[-1.5px] mb-5">
            <Image
              src={image || "/images/button.png"}
              alt="Profile"
              width={48}
              height={48}
              className=" w-12 h-12 object-cover rounded-[50%]"
            />
            <p>{username}</p>
          </div>

          {!isConnected ? (
            <button
              onClick={handleClick}
              className="w-full flex items-center justify-center gap-3
               px-4 py-3 mb-[10px] border border-white/10 rounded-lg
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
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center gap-3
               px-4 py-3 mb-[10px] border border-white/10 rounded-lg
               bg-[#8989890d] text-[color:var(--white-80)]
               font-bold text-base cursor-pointer
               transition-colors duration-300 ease-in-out
               backdrop-blur-[150px]
               hover:bg-[color:var(--Green--80)] hover:text-black"
            >
              {address?.slice(0, 6) + "..." + address?.slice(-4)}
              <br />
              disconnect
            </button>
          )}

          <div className="flex flex-col gap-2">
            {sidebarFallback.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <div
                    className={`flex items-center px-3 py-1 rounded-lg w-[214px] h-[32px] cursor-pointer
                text-[color:var(--white-60)] transition-colors duration-300 ease-in-out
                hover:bg-[#ccf693] hover:text-black
                ${isActive
                        ? "bg-[color:var(--Green--100)] text-black font-medium"
                        : ""
                      }`}
                  >
                    <Icon className="text-base mr-3" />
                    <span className="text-base font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
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
