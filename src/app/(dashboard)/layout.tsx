"use client";

import { ReactNode, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import PageHeader from "../components/pageHeader/PageHeader";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [openSidebar, setOpenSidebar] = useState(true);

  return (
    <div className="flex">
      <aside>
        <Sidebar openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      </aside>
      <div style={{ padding: "32px", flex: 1 }}>
        <main className="content">
          <div className="mt-2 flex flex-col gap-6 md:gap-4">
            <PageHeader openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
