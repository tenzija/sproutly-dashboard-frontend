// components/SetStacking.tsx
"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowDoubleIcon } from "@/theme/ArrowDoubleIcon";
import { formatThousands } from "@/utils/helper";
import { useVestingEstimate } from "@/hooks/useVestingEstimate";
import { base } from "viem/chains";
import LockupSlider from "./LockUpSlider";

const VESTING_ADDR = process.env.NEXT_PUBLIC_TOKEN_VESTING_ADDRESS as `0x${string}`;

export type SetStackingDraft = {
  amountCBY: string;
  lockSeconds: number;
  lockPeriodLabel: string;
  unlockDateText: string;
  totalSeedToReceive: string;
  claimableSeed: string;
  swapRatioLabel: string;
  displayId?: string;
};

const LOCK_OPTIONS = [
  { label: "5 Minutes", seconds: 5 * 60 },
  { label: "15 Minutes", seconds: 15 * 60 },
  { label: "30 Minutes", seconds: 30 * 60 },
  { label: "1 Hour", seconds: 1 * 3600 },
  { label: "4 Hours", seconds: 4 * 3600 },
  { label: "12 Hours", seconds: 12 * 3600 },
  { label: "1 Day", seconds: 1 * 86400 },
  { label: "2 Days", seconds: 2 * 86400 },
  { label: "3 Days", seconds: 3 * 86400 },
  { label: "4 Days", seconds: 4 * 86400 },
  { label: "5 Days", seconds: 5 * 86400 },
  { label: "7 Days", seconds: 7 * 86400 },
  { label: "14 Days", seconds: 14 * 86400 },
  { label: "1 Month", seconds: 30 * 86400 },
  { label: "3 Months", seconds: 3 * 30 * 86400 },
  { label: "6 Months", seconds: 6 * 30 * 86400 },
  { label: "12 Months", seconds: 12 * 30 * 86400 },
  { label: "24 Months", seconds: 24 * 30 * 86400 },
];

const CONTROL_SX = {
  width: 779,
  "& .MuiInputBase-root": {
    height: "37px",
    borderRadius: "33px",
    width: "746px",
    px: "16px",
    py: "8px",
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.06)",
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.16)" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.26)" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.36)" },
  },
  "& .MuiOutlinedInput-input": {
    padding: 0,
    height: "21px",
    lineHeight: "21px",
    display: "flex",
    alignItems: "center",
  },
} as const;


const isValidNumberInput = (v: string) => /^(\d+(\.\d{0,18})?)?$/.test(v);

export interface SetStackingProps {
  value: SetStackingDraft;
  onChange: (next: SetStackingDraft) => void;
  handleNext: () => void;
  handleBack: () => void;
  availableBalance?: string;
  /** optional: parent can be notified when user confirms this step */
  onConfirm?: (snapshot: SetStackingDraft) => void;
}

export default function SetStacking({
  value,
  onChange,
  handleNext,
  availableBalance,
  onConfirm,
}: SetStackingProps) {
  const { amountCBY, lockSeconds } = value;
  const [confirmed, setConfirmed] = useState(false);

  // derive current option, unlock preview
  const lockOpt = useMemo(
    () => LOCK_OPTIONS.find((o) => o.seconds === lockSeconds) ?? LOCK_OPTIONS[10],
    [lockSeconds]
  );
  const unlockDate = useMemo(() => new Date(Date.now() + lockSeconds * 1000), [lockSeconds]);
  const unlockDateText = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(unlockDate),
    [unlockDate]
  );

  // live estimate (preview)
  const est = useVestingEstimate({
    vestingAddress: VESTING_ADDR,
    amountX: amountCBY,
    durationSec: BigInt(lockSeconds),
    cliffSec: 0n,
    chainId: base.id,
  });

  // reset confirm state whenever user edits inputs
  useEffect(() => {
    setConfirmed(false);
  }, [amountCBY, lockSeconds]);

  // whenever inputs change, reset confirm gate:
  useEffect(() => {
    setConfirmed(false);
  }, [amountCBY, lockSeconds]);

  // handleConfirm enables Next and disables itself
  const handleConfirm = () => {
    if (!canContinue) return;
    const snapshot: SetStackingDraft = {
      ...value,
      lockPeriodLabel: lockOpt.label,
      unlockDateText,
      totalSeedToReceive: est.formatted.totalY ?? value.totalSeedToReceive,
    };
    onChange(snapshot);     // keep parent draft in sync
    setConfirmed(true);     // ✅ disables Review & Confirm, enables Next
    onConfirm?.(snapshot);  // optional parent callback
  };

  const onAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    if (!isValidNumberInput(v)) return;
    if (availableBalance && Number(v || "0") > Number(availableBalance)) return;
    onChange({ ...value, amountCBY: v });
  };

  const onLockChange = (secs: number, label: string) => {
    onChange({
      ...value,
      lockSeconds: secs,
      lockPeriodLabel: label,
      unlockDateText, // this will recompute next render anyway
    });
  };

  const canContinue = !!amountCBY && Number(amountCBY) > 0;

  return (
    <Box sx={{ color: "#fff", display: "flex", flexDirection: "column", gap: 2.5, mb: 1 }}>
      {/* Title */}
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Set Your Staking Terms
        </Typography>
        <Typography
          variant="body2"
          sx={{ opacity: 0.8, maxWidth: 720, mx: "auto", mt: 0.5, lineHeight: 1.5 }}
        >
          Determine the amount of <b>$CBY</b> you wish to lock and select your preferred lock-up
          period. A longer commitment rewards you with a higher <b>$SEED</b> token ratio.
        </Typography>
      </Box>

      {/* Inputs */}
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75, opacity: 0.9 }}>
            $CBY Amount to Lock
          </Typography>
          <TextField
            placeholder="0.00"
            value={amountCBY}
            onChange={onAmount}
            inputMode="decimal"
            sx={CONTROL_SX}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ fontWeight: 700, opacity: 0.9 }}>$CBY</Typography>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <LockupSlider onLockChange={onLockChange} lockSeconds={lockSeconds} />
      </Stack>

      {/* Summary cards */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 0.5 }}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: "16px",
            bgcolor: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Typography variant="caption">
            You will <Box component="span" sx={{ color: "#9FE870", fontWeight: 500 }}>Lock</Box>
          </Typography>
          <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {formatThousands(amountCBY || "0")}
            </Typography>
            <Chip label="$CBY" size="small" />
          </Box>
        </Paper>

        <Box sx={{ alignSelf: "center", color: "#9FE870" }}>
          <ArrowDoubleIcon />
        </Box>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: "16px",
            bgcolor: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Typography variant="caption">
            You will <Box component="span" sx={{ color: "#9FE870", fontWeight: 500 }}>Receive</Box>
          </Typography>
          <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {formatThousands(est.formatted.totalY ?? "0")}
            </Typography>
            <Chip label="$SEED" size="small" />
          </Box>
        </Paper>
      </Stack>

      <Typography variant="caption" sx={{ opacity: 0.75 }}>
        Estimated Total Unlock Date: <b>{unlockDateText}</b>
      </Typography>

      {/* CTA row — confirm disables itself and turns Next green */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 0.5 }}>
        {/* Review & Confirm: disabled after confirmed */}
        <Button
          onClick={handleConfirm}
          disabled={!canContinue || confirmed}
          variant="contained"
          sx={{
            flex: 1,
            py: 1.4,
            borderRadius: 999,
            bgcolor: "#b7ff57",
            color: "#000",
            fontWeight: 800,
            "&:hover": { bgcolor: "#abfb4f" },
            opacity: confirmed ? 0.6 : 1, // subtle visual cue when disabled
            pointerEvents: confirmed ? "none" : "auto",
          }}
        >
          Review &amp; Confirm Lock
        </Button>

        {/* Next: becomes lime & enabled after confirmed */}
        <Button
          onClick={handleNext}
          disabled={!confirmed}
          variant={confirmed ? "contained" : "outlined"}
          sx={{
            flex: 1,
            py: 1.4,
            borderRadius: 999,
            ...(confirmed
              ? {
                bgcolor: "#b7ff57",
                color: "#000",
                fontWeight: 800,
                "&:hover": { bgcolor: "#abfb4f" },
              }
              : {
                borderColor: "rgba(255,255,255,0.18)",
                color: "rgba(255,255,255,0.5)",
              }),
          }}
        >
          Next
        </Button>
      </Stack>

    </Box>
  );
}