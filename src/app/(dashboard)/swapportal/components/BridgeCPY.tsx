"use client";
import { useBridge } from "@/hooks/useBridge";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  calculateDestinationAmount,
  formatDisplayAmount,
  isValidNumberInput,
} from "../utils/numberUtils";
import { BridgeStepper } from "./BridgeStepper";

interface BridgeCPYProps {
  handleNext: () => void;
  currentStep: number;
}

export default function BridgeCPY({ handleNext, currentStep }: BridgeCPYProps) {
  const [amount, setAmount] = useState("");
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const { isConnected } = useAccount();
  const {
    bridge,
    progress,
    isReady,
    isOnPolygon, // tells us when wallet is actually on Polygon
    reset,
  } = useBridge();

  // local UI flag shown only after user clicks Bridge while not on Polygon
  const [uiSwitching, setUiSwitching] = useState(false);

  // Turn off "Switching…" as soon as wallet is on Polygon
  useEffect(() => {
    if (uiSwitching && isOnPolygon) setUiSwitching(false);
  }, [uiSwitching, isOnPolygon]);

  const showSwitching = uiSwitching && !isOnPolygon;
  const isBusy = showSwitching || (progress !== "idle" && progress !== "error");

  const onBridge = async () => {
    // guard accidental double-clicks or invalid preconditions
    if (isNextDisabled || !amount || !isConnected || !isReady || isBusy) return;

    // show "Switching…" only if we actually need to switch
    if (!isOnPolygon) setUiSwitching(true);

    const res = await bridge(amount); // hook will switch if needed

    // if the hook already switched us, the effect above will clear uiSwitching
    if (res.status === "success") {
      setIsNextDisabled(true); // lock Bridge, enable Next
    } else if (res.status === "userRejected" || res.status === "failed") {
      setIsNextDisabled(false); // re-enable Bridge to retry
      reset();
    }
  };

  useEffect(() => {
    if (currentStep === 1) {
      setIsNextDisabled(false);
      setUiSwitching(false);
    }
  }, [currentStep]);

  const bridgeDisabled =
    isNextDisabled || !amount || !isConnected || !isReady || isBusy;

  const nextDisabled = !isNextDisabled;

  const inputDisabled =
    isNextDisabled || !isConnected || !isReady || isBusy;

  const bridgeClass = isNextDisabled ? "next-btn" : "bridge-btn";
  const nextClass = isNextDisabled ? "bridge-btn" : "next-btn";

  // Keep all dynamic labels EXCEPT the quoting/estimating-fee one
  const bridgeLabel = !isReady
    ? "Initializing RPC…"
    : showSwitching
      ? "Switching to Polygon…"
      : progress === "approving"
        ? "Approving…"
        : progress === "approved"
          ? "Approved"
          // OMIT: progress === "quoting" (no “Estimating fee…”)
          : progress === "sending"
            ? "Sending…"
            : progress === "sent"
              ? "Sent. Waiting…"
              : progress === "waitingBase"
                ? "Finalizing on Base…"
                : progress === "done"
                  ? "Bridged"
                  : "Bridge";

  return (
    <>
      <div className="modal-header">
        <h1 className="modal-title">Bridge Your $CBY Tokens</h1>
        <p className="modal-subtitle">
          Your $CBY tokens must be on the BASE chain to proceed with this swap.
          <br /> Select your source chain below to initiate the bridge.
        </p>
      </div>

      <div className="modal-content">
        <div className="form-row">
          <div className="form-group">
            <label>Source Chain:</label>
            <input
              type="text"
              value={"Polygon"}
              className="amount-input"
              disabled
            />
            <p className="destination-info">Destination Chain: BASE Chain</p>
          </div>

          <div className="form-group">
            <label>Amount to Bridge:</label>
            <input
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) =>
                setAmount(
                  isValidNumberInput(e.target.value) ? e.target.value : amount
                )
              }
              className="amount-input"
              disabled={inputDisabled}
            />
            {/* Removed the “Estimated Bridging Fee” section */}
          </div>
        </div>

        <div className="bridge-cards">
          <div className="bridge-card source-card">
            <div className="card-header">Source Chain</div>
            <div className="card-amount">
              {formatDisplayAmount(amount)} <span className="token">$CBY</span>
            </div>
          </div>

          <div className="arrow-container">
            <div className="bridge-arrow">→</div>
          </div>

          <div className="bridge-card destination-card">
            <div className="card-header">BASE Chain</div>
            <div className="card-amount">
              {calculateDestinationAmount(amount)}{" "}
              <span className="token">$CBY</span>
            </div>
          </div>
        </div>

        <div className="action-buttons" style={{ marginBottom: "20px" }}>
          <button className={bridgeClass} onClick={onBridge} disabled={bridgeDisabled}>
            {bridgeLabel}
          </button>

          <button className={nextClass} onClick={handleNext} disabled={nextDisabled}>
            Next
          </button>
        </div>

        {progress !== "idle" && progress !== "error" && (
          <BridgeStepper progress={progress} />
        )}
      </div>
    </>
  );
}
