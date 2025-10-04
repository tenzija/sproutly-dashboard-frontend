import React, { useState, useEffect } from "react";
import { Box, Typography, Slider } from "@mui/material";

const LOCK_OPTIONS = [
    { label: "1 Day", seconds: 1 * 86400 },
    { label: "2 Days", seconds: 2 * 86400 },
    { label: "3 Days", seconds: 3 * 86400 },
    { label: "4 Days", seconds: 4 * 86400 },
    { label: "5 Days", seconds: 5 * 86400 },
];

const neonSliderStyles = {
    "& .MuiSlider-thumb": {
        backgroundColor: "#b0fe2f",
        borderRadius: "50%",
        border: "2px solid #b0fe2f",
        width: 20,
        height: 20,
        boxShadow: "0 0 10px rgba(0,255,0,.75)",
    },
    "& .MuiSlider-rail": { backgroundColor: "#333" },
    "& .MuiSlider-track": { backgroundColor: "#b0fe2f" },
    "& .MuiSlider-mark": { backgroundColor: "#b0fe2f" },
    "& .MuiSlider-root": { color: "#b0fe2f" },
};

const edgeSafeLabelSx = (count: number) => ({
    "& .MuiSlider-markLabel": {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: `calc(100% / ${count})`,
        transform: "translateX(-50%)",
        pointerEvents: "none",
    },
    "& .MuiSlider-markLabel:first-of-type": {
        transform: "translateX(0%)",
        left: "0% !important",
        textAlign: "left",
    },
    "& .MuiSlider-markLabel:last-of-type": {
        transform: "translateX(-100%)",
        left: "100% !important",
        textAlign: "right",
    },
});

const SIDE_GUTTER_PX = 16;

export default function LockupSlider({
    onLockChange,
    lockSeconds, // <- comes from parent
}: {
    onLockChange: (seconds: number, label: string) => void;
    lockSeconds?: number;
}) {
    // default to first option
    const [idx, setIdx] = useState<number>(0);

    // 🔑 map lockSeconds -> index (exact match OR nearest)
    useEffect(() => {
        if (lockSeconds == null) return;

        const exact = LOCK_OPTIONS.findIndex(o => o.seconds === lockSeconds);
        if (exact !== -1) {
            setIdx(exact);
            return;
        }

        // pick the nearest option if the exact one isn't present
        let nearest = 0;
        let best = Number.POSITIVE_INFINITY;
        LOCK_OPTIONS.forEach((o, i) => {
            const d = Math.abs(o.seconds - lockSeconds);
            if (d < best) {
                best = d;
                nearest = i;
            }
        });
        setIdx(nearest);
    }, [lockSeconds]);

    const marks = LOCK_OPTIONS.map((o, i) => ({ value: i, label: o.label }));

    const handleSliderChange = (_: Event, value: number | number[]) => {
        const i = Array.isArray(value) ? value[0] : value;
        setIdx(i);
        const opt = LOCK_OPTIONS[i];
        onLockChange(opt.seconds, opt.label);
    };

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.75, opacity: 0.9 }}>
                Lock-up Period
            </Typography>

            <Box sx={{ width: "100%", position: "relative", px: `${SIDE_GUTTER_PX}px` }}>
                <Slider
                    value={idx}                     // controlled by index
                    onChange={handleSliderChange}
                    min={0}
                    max={LOCK_OPTIONS.length - 1}
                    step={1}
                    marks={marks}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => LOCK_OPTIONS[v]?.label ?? ""}
                    sx={[neonSliderStyles, edgeSafeLabelSx(LOCK_OPTIONS.length)]}
                />
            </Box>
        </Box>
    );
}
