"use client"

import { useState } from "react"
import TabNavigation from "./components/tab-navigation"
import OverviewTab from "./components/overview-tab"

export default function Page() {
    const [activeTab, setActiveTab] = useState("Overview")

    return (
        <section className="">
            {/* Tab Navigation */}
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === "Overview" && <OverviewTab />}
            {activeTab === "Proposals" && <div>
                Proposals data
            </div>}
            {activeTab === "Treasury" && <div>
                Treasury data
            </div>}
        </section>
    )
}
