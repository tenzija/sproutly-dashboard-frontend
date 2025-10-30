"use client"

interface TabNavigationProps {
    activeTab: string
    setActiveTab: (tab: string) => void
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
    const tabs = ["Overview", "Proposals", "Treasury"]

    return (
        <div className='bg-[rgba(137,_137,_137,_0.05)] py-2 px-2 lg:px-6 xl:py-5 xl:px-8 backdrop-blur-[150px] border border-[rgba(255,_255,_255,_0.09)] rounded-lg lg:rounded-2xl'>
            <div className="flex flex-wrap items-center gap-1 xl:gap-2 rounded-lg  lg:rounded-[44px] overflow-hidden w-full relative border border-[rgba(255,_255,_255,_0.09)] p-2 lg:p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-1 text-xs xl:text-base font-bold transition-all duration-300 lg:flex-1  rounded-[50px] w-full max-w-[calc(50%-2px)]
                                ${activeTab === tab ? "bg-[rgba(255,_255,_255,_0.8)] text-[#233010]" : "text-[rgba(255,_255,_255,_0.6)] hover:text-white"}`
                        }
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    )
}
