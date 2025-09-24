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
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowDoubleIcon } from "@/theme/ArrowDoubleIcon";
import { formatThousands } from "@/utils/helper";
import { useVestingEstimate } from "@/hooks/useVestingEstimate";
import { base } from "viem/chains";
import { useStakeToken } from "@/hooks/useStakeToken";

/* helpers */
const isValidNumberInput = (v: string) => /^(\d+(\.\d{0,18})?)?$/.test(v);

const NEXT_PUBLIC_TOKEN_VESTING_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_VESTING_ADDRESS as `0x${string}`;
const NEXT_PUBLIC_CBY_ADDRESS = process.env.NEXT_PUBLIC_CBY_ADDRESS as `0x${string}`;

const addMonths = (d: Date, m: number) => {
  const x = new Date(d);
  const day = x.getDate();
  x.setMonth(x.getMonth() + m);
  if (x.getDate() < day) x.setDate(0);
  return x;
};
const fmtDate = (d: Date) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

interface SetStackingProps {
  handleNext: () => void;
  handleBack: () => void;
}

// constants for the control spec (so you can reuse for Select too)
const CONTROL_SX = {
  width: 779,                         // Figma: 779px
  "& .MuiInputBase-root": {
    height: 37,                       // Figma: 37px
    borderRadius: 33,                 // Figma: 33px
    px: 2,                            // 16px right/left
    py: 1,                            // 8px top/bottom
    display: "flex",
    justifyContent: "space-between",  // Figma: space-between
    backgroundColor: "rgba(255,255,255,0.06)",
    // neutral borders (no neon)
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.16)", // 1px
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.26)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.36)",
    },
  },
  // remove extra inner padding so total height stays 37px
  "& .MuiOutlinedInput-input": {
    p: 0,
    lineHeight: 1.2,
  },
} as const;

// put next to CONTROL_SX
const SELECT_TWEAK_SX = {
  // outer shell already sized by CONTROL_SX (37px / 33px / 8–16px)
  "& .MuiInputBase-root": {
    height: "37px",
    borderRadius: "33px",
    px: "16px",
    py: "8px",
    display: "flex",
    alignItems: "center",
  },
  // remove default inner paddings so text isn't pushed/cut
  "& .MuiOutlinedInput-input": {
    padding: 0,
    height: "21px",
    lineHeight: "21px",
    display: "flex",
    alignItems: "center",
  },
  // Select uses this slot for the displayed value
  "& .MuiSelect-select": {
    padding: 0,
    height: "21px",
    lineHeight: "21px",
    display: "flex",
    alignItems: "center",
  },
} as const;


export default function SetStacking({ handleNext, handleBack }: SetStackingProps) {
  const [amount, setAmount] = useState<string>("0");
  const [lockMonths, setLockMonths] = useState<number>(1);
  const { stake, isMining } = useStakeToken();

  const lockDisplay = useMemo(() => formatThousands(amount || "0"), [amount]);
  const receiveDisplay = lockDisplay; // plug your ratio here
  const unlockDate = useMemo(() => fmtDate(addMonths(new Date(), lockMonths)), [lockMonths]);

  const onAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.trim();
    console.log(v);
    if (isValidNumberInput(v)) setAmount(v);
  };
  const onLock = (e: SelectChangeEvent<number>) => setLockMonths(Number(e.target.value));

  const disabled = !amount || Number(amount) <= 0;

  const est = useVestingEstimate({
    vestingAddress: NEXT_PUBLIC_TOKEN_VESTING_ADDRESS,
    amountX: amount,
    durationSec: BigInt(lockMonths * 30 * 86400),
    cliffSec: BigInt(0),
    chainId: base.id, // set if you want to force Base
  });

  const handleStack = async () => {
    if (disabled) return;
    try {
      await stake({
        vestingAddress: NEXT_PUBLIC_TOKEN_VESTING_ADDRESS,
        tokenX: NEXT_PUBLIC_CBY_ADDRESS,
        amount,
        lockMonths: lockMonths,
        cliffDays: 0,
        slicePeriodSeconds: 86_400n,
        revocable: false,
        decimals: 18,
      });
      // show success
    } catch (e) {
      console.error(e);
      // show error
    }
  }

  return (
    <Box sx={{ color: "#fff", display: "flex", flexDirection: "column", gap: 2.5, mb: 1 }}>
      {/* Back link */}
      <Box sx={{ mt: 1 }}>
        <Button onClick={handleBack} sx={{ color: "rgba(255,255,255,0.85)", px: 0 }}>
          {"<"}
        </Button>
      </Box>
      {/* Title & subtitle */}
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
        {/* Amount field with right-side $CBY */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75, opacity: 0.9 }}>
            $CBY Amount to Lock
          </Typography>
          <TextField
            fullWidth={false}          // we want the fixed 779px width
            placeholder="0.00"
            value={amount}
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

        {/* Lock-up Period (dropdown) */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.75, opacity: 0.9 }}>
            Lock-up Period
          </Typography>
          <FormControl sx={{ ...CONTROL_SX, ...SELECT_TWEAK_SX }}>
            <Select<number>
              value={lockMonths}
              onChange={onLock}
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
              <MenuItem value={1}>1 Month</MenuItem>
              <MenuItem value={3}>3 Months</MenuItem>
              <MenuItem value={6}>6 Months</MenuItem>
              <MenuItem value={12}>12 Months</MenuItem>
              <MenuItem value={18}>18 Months</MenuItem>
              <MenuItem value={24}>24 Months</MenuItem>
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
            borderRadius: "16px", // was 24/16 → make flatter like figma
            bgcolor: "rgba(255,255,255,0.035)", // same surface as left (figma looks uniform)
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Typography variant="caption" sx={{ letterSpacing: 0.6 }}>
            You will{" "}
            <Box component="span" sx={{ color: "#9FE870", fontWeight: 500 }}>
              Lock
            </Box>
          </Typography>
          <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
              {receiveDisplay}
            </Typography>
            <Chip label="$CBY" size="small" />
          </Box>
        </Paper>

        <Box
          sx={{
            alignSelf: "center",
            color: "#9FE870", // or #9FE870 if you want green
          }}
        >
          <ArrowDoubleIcon />
        </Box>

        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 2.5,
            borderRadius: "16px", // was 24/16 → make flatter like figma
            bgcolor: "rgba(255,255,255,0.035)", // same surface as left (figma looks uniform)
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Typography variant="caption" sx={{ letterSpacing: 0.6 }}>
            You will{" "}
            <Box component="span" sx={{ color: "#9FE870", fontWeight: 500 }}>
              Receive
            </Box>
          </Typography>
          <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
              {formatThousands(est.formatted.totalY || "0")}
            </Typography>
            <Chip label="$CBY" size="small" />
          </Box>
        </Paper>
      </Stack>

      {/* Unlock date */}
      <Typography variant="caption" sx={{ opacity: 0.75 }}>
        Estimated Total Unlock Date: <b>{unlockDate}</b>
      </Typography>

      {/* CTA row (green + ghost Next) */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 0.5 }}>
        <Button
          onClick={handleStack}
          disabled={disabled}
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
          Review &amp; Confirm Lock
        </Button>

        <Button
          disabled
          onClick={handleNext}
          variant="outlined"
          sx={{
            flex: 1,
            py: 1.4,
            borderRadius: 999,
            borderColor: "rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.5)",
          }}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
}
