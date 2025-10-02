"use client";
import { useBridge } from "@/hooks/useBridge";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { calculateDestinationAmount, formatDisplayAmount, isValidNumberInput } from "../utils/numberUtils";


interface BridgeCPYProps {
  handleNext: () => void;
  currentStep: number;
}

export default function BridgeCPY({ handleNext, currentStep }: BridgeCPYProps) {
  const [sourceChain, setSourceChain] = useState("Polygon");
  const [amount, setAmount] = useState("");
  const [isNextDisabled, setIsNextDisabled] = useState(false)
  const { isConnected } = useAccount();
  const { bridge, progress, error, txHash, bridgingMs, isReady, isOnPolygon, reset } = useBridge();

  const onBridge = async () => {
    // Immediately disable Bridge & enable Next

    // If you want to run the actual bridge flow, uncomment this:
    const res = await bridge(amount);
    if (res.status === 'success') {
      setIsNextDisabled(true);
    }
    if (res.status === 'userRejected') {
      // Re-enable Bridge & keep Next disabled if user cancelled
      setIsNextDisabled(false);
      reset();
    }
  };

  useEffect(() => {
    if (currentStep === 1) {
      // entering this step -> reset to default: Bridge enabled, Next disabled
      setIsNextDisabled(false);
    }
  }, [currentStep]);

  const bridgeDisabled =
    isNextDisabled || // <- disable after click
    !amount ||
    !isConnected ||
    !isReady ||
    progress === "sending" ||
    progress === "waitingBase";

  const nextDisabled = !isNextDisabled; // <- until Bridge clicked

  const inputDisabled =
    isNextDisabled || // <- lock input after Bridge clicked
    !isConnected ||
    !isReady ||
    progress === "sending" ||
    progress === "waitingBase";

  // 🔁 swap classes after click
  const bridgeClass = isNextDisabled ? 'next-btn' : 'bridge-btn';
  const nextClass = isNextDisabled ? 'bridge-btn' : 'next-btn';

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
            <label>Source Chain</label>
            <div className="select-wrapper">
              <select value={sourceChain} onChange={(e) => setSourceChain(e.target.value)} className="chain-select">
                <option value="Polygon">Polygon</option>
                {/* If you add multi-source later, switch clients by chainId */}
              </select>
            </div>
            <p className="destination-info">Destination Chain: BASE Chain</p>
          </div>

          <div className="form-group">
            <label>Amount to Bridge:</label>
            <input
              type="text"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(isValidNumberInput(e.target.value) ? e.target.value : amount)}
              className="amount-input"
              disabled={inputDisabled}
            />
            <p className="fee-info">
              Estimated Bridging Fee: <span style={{ color: "#9FE870", fontWeight: 500 }}>~ 1.0 POL</span>
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

        <div className="action-buttons">
          <button className={bridgeClass} onClick={onBridge} disabled={bridgeDisabled}
          >
            {!isReady
              ? 'Initializing RPC…'
              : progress === 'sending'
                ? 'Sending…'
                : progress === 'waitingBase'
                  ? 'Finalizing on Base…'
                  : isOnPolygon
                    ? 'Bridge'
                    : 'Switching to Polygon…'}
          </button>

          <button
            className={nextClass}
            onClick={handleNext}
            disabled={nextDisabled}
          >
            Next
          </button>
        </div>

        {/* Status & debug */}
        <div className="mt-3 text-sm opacity-80">
          {progress !== "idle" && <div>Status: {progress}</div>}
          {txHash && <div>Polygon tx: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">{txHash}</a></div>}
          {typeof bridgingMs === "number" && <div>Bridging time: {bridgingMs} ms</div>}
          {error && <div className="text-red-400">Error: {error}</div>}
        </div>
      </div>
    </>
  );
}
