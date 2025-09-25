// components/SetStacking.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowDoubleIcon } from "@/theme/ArrowDoubleIcon";
import { formatThousands } from "@/utils/helper";
import { useVestingEstimate } from "@/hooks/useVestingEstimate";
import { base } from "viem/chains";
import { useStakeToken } from "@/hooks/useStakeToken";

const VESTING_ADDR = process.env.NEXT_PUBLIC_TOKEN_VESTING_ADDRESS as `0x${string}`;
const TOKEN_X_ADDR = process.env.NEXT_PUBLIC_CBY_ADDRESS as `0x${string}`;

const isValidNumberInput = (v: string) => /^(\d+(\.\d{0,18})?)?$/.test(v);

type LockOption = { label: string; seconds: number };

const LOCK_OPTIONS: LockOption[] = [
  { label: "5 Minutes", seconds: 5 * 60 },
  { label: "15 Minutes", seconds: 15 * 60 },
  { label: "30 Minutes", seconds: 30 * 60 },
  { label: "1 Hour", seconds: 1 * 3600 },
  { label: "4 Hours", seconds: 4 * 3600 },
  { label: "12 Hours", seconds: 12 * 3600 },
  { label: "1 Day", seconds: 1 * 86400 },
  { label: "3 Days", seconds: 3 * 86400 },
  { label: "7 Days", seconds: 7 * 86400 },
  { label: "14 Days", seconds: 14 * 86400 },
  { label: "1 Month", seconds: 30 * 86400 },
  { label: "3 Months", seconds: 3 * 30 * 86400 },
  { label: "6 Months", seconds: 6 * 30 * 86400 },
  { label: "12 Months", seconds: 12 * 30 * 86400 },
  { label: "24 Months", seconds: 24 * 30 * 86400 },
];

const fmtDate = (d: Date) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

// Figma control styling
const CONTROL_SX = {
  width: 779,
  "& .MuiInputBase-root": {
    height: "37px",
    borderRadius: "33px",
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
    lineHeight: "21px",
    height: "21px",
    display: "flex",
    alignItems: "center",
  },
} as const;

const SELECT_TWEAK_SX = {
  "& .MuiInputBase-root": {
    height: "37px",
    borderRadius: "33px",
    px: "16px",
    py: "8px",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiOutlinedInput-input": {
    padding: 0,
    height: "21px",
    lineHeight: "21px",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiSelect-select": {
    padding: 0,
    height: "21px",
    lineHeight: "21px",
    display: "flex",
    alignItems: "center",
  },
} as const;

interface SetStackingProps {
  handleNext: () => void;
  handleBack: () => void;
  availableBalance?: string; // optional cap
}

export default function SetStacking({
  handleNext,
  handleBack,
  availableBalance,
}: SetStackingProps) {
  const [amount, setAmount] = useState<string>("0");

  // ✅ Store seconds in state (primitive), never undefined
  const DEFAULT_SECONDS = LOCK_OPTIONS[10].seconds; // "1 Month"
  const [lockSeconds, setLockSeconds] = useState<number>(DEFAULT_SECONDS);
  const [enableNext, setEnableNext] = useState<boolean>(false);

  // derive the option (always falls back)
  const lockOpt = useMemo(
    () => LOCK_OPTIONS.find((o) => o.seconds === lockSeconds) ?? LOCK_OPTIONS[0],
    [lockSeconds]
  );

  const { stake, isMining } = useStakeToken();

  const durationSec = useMemo(() => BigInt(lockSeconds), [lockSeconds]);

  const unlockDate = useMemo(
    () => new Date(Date.now() + lockSeconds * 1000),
    [lockSeconds]
  );

  const lockDisplay = useMemo(() => formatThousands(amount || "0"), [amount]);

  const est = useVestingEstimate({
    vestingAddress: VESTING_ADDR,
    amountX: amount,
    durationSec,
    cliffSec: 0n,
    chainId: base.id,
  });

  const onAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    if (!isValidNumberInput(v)) return;
    if (availableBalance) {
      if (Number(v || "0") <= Number(availableBalance)) setAmount(v);
    } else {
      setAmount(v);
    }
  };
  const onAmountBlur = () => setAmount((prev) => (prev ? String(Number(prev)) : "0"));

  const disabled = !amount || Number(amount) <= 0 || durationSec <= 0n || isMining;

  const handleStack = async () => {
    if (disabled) return;
    try {
      const res = await stake({
        vestingAddress: VESTING_ADDR,
        tokenX: TOKEN_X_ADDR,
        amount,
        durationSec,                // seconds from dropdown
        cliffDays: 0,
        slicePeriodSeconds: 86_400n,
        revocable: false,
        decimals: 18,
      });

      // const res = {
      //   stakeHash: "0xe66ec4d603795f90489f38d3a7c2381d6cfcfd9df7008c216bc528d2e96d1b26"
      // }

      if (res.stakeHash) {
        setEnableNext(true);
      }


      console.log("Stake submitted:", res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ color: "#fff", display: "flex", flexDirection: "column", gap: 2.5, mb: 1 }}>
      {/* Back */}
      <Box sx={{ mt: 1 }}>
        <Button onClick={handleBack} sx={{ color: "rgba(255,255,255,0.85)", px: 0 }}>
          {"<"}
        </Button>
      </Box>

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
        {/* Amount */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75, opacity: 0.9 }}>
            $CBY Amount to Lock
          </Typography>
          <TextField
            placeholder="0.00"
            value={amount}
            onChange={onAmount}
            onBlur={onAmountBlur}
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

        {/* Lock-up Period (single dropdown with mixed units) */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75, opacity: 0.9 }}>
            Lock-up Period
          </Typography>
          <FormControl sx={{ ...CONTROL_SX, ...SELECT_TWEAK_SX }}>
            <Select<number>
              value={lockSeconds}
              onChange={(e) => setLockSeconds(Number(e.target.value))}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "rgba(15,15,15,0.96)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    borderRadius: "16px",
                    backdropFilter: "blur(4px)",
                  },
                },
              }}
            >
              {LOCK_OPTIONS.map((o) => (
                <MenuItem key={o.seconds} value={o.seconds}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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
          <Typography variant="caption" sx={{ letterSpacing: 0.6 }}>
            You will <Box component="span" sx={{ color: "#9FE870", fontWeight: 500 }}>Lock</Box>
          </Typography>
          <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
              {lockDisplay}
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
          <Typography variant="caption" sx={{ letterSpacing: 0.6 }}>
            You will <Box component="span" sx={{ color: "#9FE870", fontWeight: 500 }}>Receive</Box>
          </Typography>
          <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
              {formatThousands(est.formatted.totalY ?? "0")}
            </Typography>
            <Chip label="$CBY" size="small" />
          </Box>
        </Paper>
      </Stack>

      {/* Unlock date */}
      <Typography variant="caption" sx={{ opacity: 0.75 }}>
        Estimated Total Unlock Date: <b>{fmtDate(unlockDate)}</b>
      </Typography>

      {/* CTAs */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 0.5 }}>
        <Button
          onClick={handleStack}
          disabled={enableNext}
          variant="contained"
          sx={{
            flex: 1,
            py: 1.4,
            borderRadius: 999,
            bgcolor: "#b7ff57",
            color: "#000",
            fontWeight: 800,
            "&:hover": { bgcolor: "#abfb4f" },
          }}
        >
          {isMining ? "Submitting…" : "Review & Confirm Lock"}
        </Button>

        <Button
          disabled={!enableNext}
          onClick={handleNext}
          variant="contained"
          sx={{
            flex: 1,
            py: 1.4,
            borderRadius: 999,
            bgcolor: !isMining ? "#b7ff57" : "rgba(255,255,255,0.18)",
            color: !isMining ? "#000" : "rgba(255,255,255,0.5)",
            fontWeight: 800,
            "&:hover": {
              bgcolor: !isMining ? "#abfb4f" : "rgba(255,255,255,0.18)",
            },
          }}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}
