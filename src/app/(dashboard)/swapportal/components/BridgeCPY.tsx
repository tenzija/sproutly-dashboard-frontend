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
    isOnPolygon, // still useful to decide if we’ll show the “switching” label AFTER click
    reset,
  } = useBridge();

  // local UI flag shown only after user clicks Bridge while not on Polygon
  const [uiSwitching, setUiSwitching] = useState(false);

  const onBridge = async () => {
    // show "Switching to Polygon…" only if we actually need to switch
    if (!isOnPolygon) setUiSwitching(true);

    const res = await bridge(amount); // hook will switch if needed

    setUiSwitching(false);
    console.log("res", res);
    if (res.status === "success") {
      setIsNextDisabled(true);
    } else if (res.status === "userRejected") {
      setIsNextDisabled(false);
      reset();
    } else if (res.status === "failed") {
      setIsNextDisabled(false);
      reset();
    }
    // for failed/wrongNetwork you may keep Next disabled and show error message
  };

  useEffect(() => {
    if (currentStep === 1) {
      setIsNextDisabled(false);
      setUiSwitching(false);
    }
  }, [currentStep]);

  const bridgeDisabled =
    isNextDisabled ||
    !amount ||
    !isConnected ||
    !isReady ||
    uiSwitching || // prevent double-click while switching
    progress === "sending" ||
    progress === "waitingBase";

  const nextDisabled = !isNextDisabled;

  const inputDisabled =
    isNextDisabled ||
    !isConnected ||
    !isReady ||
    uiSwitching ||
    progress === "sending" ||
    progress === "waitingBase";

  const bridgeClass = isNextDisabled ? "next-btn" : "bridge-btn";
  const nextClass = isNextDisabled ? "bridge-btn" : "next-btn";

  // compute button label WITHOUT using isOnPolygon at mount
  const bridgeLabel = !isReady
    ? "Initializing RPC…"
    : uiSwitching
      ? "Switching to Polygon…"
      : progress === "sending"
        ? "Sending…"
        : progress === "waitingBase"
          ? "Finalizing on Base…"
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
            <label>Amount to Bridge:</label>
            <input
              type="text"
              placeholder="Enter amount"
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
            <p className="fee-info">
              Estimated Bridging Fee:{" "}
              <span style={{ color: "#9FE870", fontWeight: 500 }}>
                ~ 1.0 POL
              </span>
              <span className="info-icon">ⓘ</span>
            </p>
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

        {/* --- Clean, edge-safe status panel --- */}
        {progress !== "idle" && progress !== "error" && (
          <BridgeStepper progress={progress} />
        )}
      </div>
    </>
  );
}
