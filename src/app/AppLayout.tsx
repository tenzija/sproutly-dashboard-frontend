"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";
const HIDE_SIDEBAR_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
const [isClient, setIsClient] = useState(isAuthenticated);
useEffect(() => {
  setIsClient(isAuthenticated);
}, []);
  if (HIDE_SIDEBAR_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }
  if (!isClient) {
    return children;
  }


  
  return (
    <div className="flex">
      <aside>
        <Sidebar />
      </aside>
      <div style={{ padding: "32px", flex: 1 }}>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

