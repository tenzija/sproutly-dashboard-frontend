import { ToggleButtonGroup, ToggleButton, ButtonBase, Box } from "@mui/material";
import { MouseEvent } from "react";

export default function BuySellToggle({ activeTab, setActiveTab }: { activeTab: "buy" | "sell", setActiveTab: (tab: "buy" | "sell") => void }) {

    const handleChange = (
        _event: MouseEvent<HTMLElement>,
        newValue: "buy" | "sell" | null
    ) => {
        if (newValue !== null) setActiveTab(newValue);
    };

    return (
        <Box
            sx={{
                position: "relative",
                display: "flex",
                width: 148,
                height: 44,
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(137,137,137,0.05)",
                p: "4px",
                overflow: "hidden",
            }}
        >
            {/* Animated highlight */}
            <Box
                sx={{
                    position: "absolute",
                    top: 4,
                    left: activeTab === "buy" ? 4 : "calc(50% + 4px)",
                    width: "calc(50% - 8px)",
                    height: "calc(100% - 8px)",
                    borderRadius: "999px",
                    backgroundColor: "white",
                    boxShadow: "0 0 10px rgba(173,241,81,0.4)",
                    transition: "all 0.3s ease",
                }}
            />

            {/* Buttons */}
            <ButtonBase
                onClick={() => setActiveTab("buy")}
                sx={{
                    flex: 1,
                    borderRadius: "999px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: activeTab === "buy" ? "#000" : "#fff",
                    zIndex: 1,
                    transition: "color 0.3s ease",
                }}
            >
                Buy
            </ButtonBase>

            <ButtonBase
                onClick={() => setActiveTab("sell")}
                sx={{
                    flex: 1,
                    borderRadius: "999px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: activeTab === "sell" ? "#000" : "#fff",
                    zIndex: 1,
                    transition: "color 0.3s ease",
                }}
            >
                Sell
            </ButtonBase>
        </Box>
    );
}
