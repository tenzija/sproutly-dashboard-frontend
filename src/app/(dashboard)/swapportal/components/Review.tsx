// components/Review.tsx
"use client";

import React, { useState } from "react";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { ArrowDoubleIcon } from "@/theme/ArrowDoubleIcon";
import { formatThousands as fmt } from "@/utils/helper";
import { useStakeToken } from "@/hooks/useStakeToken";

const GREEN = "#9FE870";
const CARD_SX = { p: 2.5, borderRadius: "16px", bgcolor: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.12)" } as const;

export type StakeParamsForReview = {
  amountCBY: string;
  lockSeconds: number;
};

export interface ConfirmSwapProps {
  displayId?: string;
  amountCBY?: string;
  totalSeedToReceive?: string;
  claimableSeed?: string;
  lockPeriodLabel?: string;
  swapRatioLabel?: string;
  unlockDateText?: string;

  handleNext: () => void;
  handleBack: () => void;

  isConfirming?: boolean;
  confirmDisabled?: boolean;

  /** passed from parent for final call */
  stakeParams: StakeParamsForReview;
}

const VESTING_ADDR = process.env.NEXT_PUBLIC_TOKEN_VESTING_ADDRESS as `0x${string}`;
const TOKEN_X_ADDR = process.env.NEXT_PUBLIC_CBY_ADDRESS as `0x${string}`;

export default function Review({
  displayId = "#001",
  amountCBY = "10000",
  totalSeedToReceive = "12000",
  lockPeriodLabel = "12 Months",
  swapRatioLabel = "1 $CBY = 1.2 $SEED",
  unlockDateText = "September 8, 2026",
  handleBack,
  handleNext,
  confirmDisabled,
  stakeParams,
}: ConfirmSwapProps) {
  const { stake, isApproving, isStaking } = useStakeToken();
  const [submitting, setSubmitting] = useState(false);

  const onConfirm = async () => {
    try {
      setSubmitting(true);

      const res = await stake({
        vestingAddress: VESTING_ADDR,
        tokenX: TOKEN_X_ADDR,
        amount: stakeParams.amountCBY,
        durationSec: BigInt(stakeParams.lockSeconds),
        cliffDays: 0,
        slicePeriodSeconds: 86_400n,
        revocable: true,
        decimals: 18,
      });

      console.log("stake response", res);

      if (res.ok) {
        handleNext(); // go to success
      }
      setSubmitting(false);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const confirmIsDisabled = !!confirmDisabled || submitting || isApproving || isStaking;

  return (
    <Box sx={{ color: "#fff", display: "flex", flexDirection: "column", gap: 2.5, mb: 1 }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Review &amp; Confirm Your Swap
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8, maxWidth: 720, mx: "auto", mt: 0.5 }}>
          Please review all details carefully before confirming your $CBY lock. Your tokens
          will be locked according to the terms below
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ ...CARD_SX, p: 3 }}>
        <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mb: 0.75 }}>
          {displayId}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: 28, lineHeight: 1.2, letterSpacing: 0.2 }}>
            {fmt(amountCBY)} <Box component="span" sx={{ color: GREEN }}>$CBY</Box>
          </Typography>
        </Box>

        {/* Row using thin borders as dividers (no stretch) */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.7, mb: 0.5 }}>
              Lock Period
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
              {lockPeriodLabel}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: "0 0 auto",
              height: 32,
              mx: 3,
              borderLeft: "1px solid rgba(255,255,255,0.12)",
            }}
          />

          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.7, mb: 0.5 }}>
              Total $SEED to be Received
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
              {fmt(totalSeedToReceive)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>Swap Ratio</Typography>
          <Typography sx={{ opacity: 0.8 }}>{swapRatioLabel}</Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 1.5 }}>
          <Paper elevation={0} sx={{ ...CARD_SX, flex: 1 }}>
            <Typography variant="caption">You will <Box component="span" sx={{ color: GREEN, fontWeight: 500 }}>Lock</Box></Typography>
            <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{fmt(amountCBY)}</Typography>
              <Chip label="$CBY" size="small" />
            </Box>
          </Paper>

          <Box sx={{ alignSelf: "center", color: GREEN }}>
            <ArrowDoubleIcon />
          </Box>

          <Paper elevation={0} sx={{ ...CARD_SX, flex: 1 }}>
            <Typography variant="caption">You will <Box component="span" sx={{ color: GREEN, fontWeight: 500 }}>Receive</Box></Typography>
            <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{fmt(totalSeedToReceive)}</Typography>
              <Chip label="$SEED" size="small" />
            </Box>
          </Paper>
        </Stack>

        <Typography variant="caption" sx={{ opacity: 0.75, mt: 2 }}>
          Estimated Total Unlock Date: <b>{unlockDateText}</b>
        </Typography>
      </Paper>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Button
          onClick={handleBack}
          variant="outlined"
          sx={{
            flex: 1, py: 1.4, borderRadius: 999,
            borderColor: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)",
          }}
        >
          Back
        </Button>

        <Button
          onClick={onConfirm}
          disabled={confirmIsDisabled}
          variant="contained"
          sx={{
            flex: 1, py: 1.4, borderRadius: 999,
            bgcolor: confirmIsDisabled ? "rgba(255,255,255,0.18)" : "#b7ff57",
            color: confirmIsDisabled ? "rgba(255,255,255,0.5)" : "#000",
            fontWeight: 800,
            "&:hover": { bgcolor: confirmIsDisabled ? "rgba(255,255,255,0.18)" : "#abfb4f" },
          }}
        >
          {submitting || isApproving || isStaking ? "Confirming…" : "Confirm Lock & Swap"}
        </Button>
      </Stack>
    </Box>
  );
}
