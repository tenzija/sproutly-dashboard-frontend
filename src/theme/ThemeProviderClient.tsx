"use client";

import { PropsWithChildren, useMemo } from "react";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

export default function ThemeProviderClient({ children }: PropsWithChildren) {
    const theme = useMemo(() => {
        // neutrals to match figma
        const SURFACE = "rgba(255,255,255,0.06)";
        const BORDER = "rgba(255,255,255,0.16)";
        const BORDER_HOVER = "rgba(255,255,255,0.26)";
        const BORDER_FOCUS = "rgba(255,255,255,0.36)"; // ← NOT green

        return createTheme({
            typography: {
                fontFamily: 'var(--font-satoshi), ui-sans-serif, system-ui, sans-serif',
            },
            palette: {
                mode: "dark",
                background: { default: "#0b0b0b", paper: "#0b0b0b" },
                text: { primary: "#fff" },
                // keep primary green for accents elsewhere, not input borders
                primary: { main: "#b7ff57" },
            },
            shape: { borderRadius: 12 }, // base radius smaller
            components: {
                // TextField / Select shells
                MuiOutlinedInput: {
                    styleOverrides: {
                        root: {
                            backgroundColor: SURFACE,
                            borderRadius: 24, // inputs are more pill-like than cards
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: BORDER,
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: BORDER_HOVER,
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: BORDER_FOCUS,
                            },
                            // subtle inner emphasis instead of neon glow
                            "&.Mui-focused": {
                                boxShadow: `inset 0 0 0 1px ${BORDER_FOCUS}`,
                            },
                            "& .MuiSelect-icon": { color: "#fff" },
                        },
                        input: { color: "#fff" },
                    },
                },
                // Dropdown popup surface
                MuiMenu: {
                    styleOverrides: {
                        paper: {
                            backgroundColor: "rgba(15,15,15,0.96)",
                            border: `1px solid ${BORDER}`,
                            borderRadius: 12,
                            backdropFilter: "blur(4px)",
                        },
                    },
                },
                MuiMenuItem: {
                    styleOverrides: {
                        root: {
                            color: "#fff",
                            "&.Mui-selected": {
                                backgroundColor: "rgba(255,255,255,0.08)", // neutral, not green
                            },
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
                        },
                    },
                },
                // Chips used for $CBY label
                MuiChip: {
                    styleOverrides: {
                        root: {
                            borderRadius: 10, // less round
                            backgroundColor: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.9)",
                        },
                        label: { fontWeight: 600 },
                    },
                },
            },
        });
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
