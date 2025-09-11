"use client";

import { ReactNode } from "react";
import Sidebar from "./components/sidebar/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <aside>
        <Sidebar />
      </aside>
      <div className="main-layout" style={{ padding: "32px", flex: 1 }}>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
