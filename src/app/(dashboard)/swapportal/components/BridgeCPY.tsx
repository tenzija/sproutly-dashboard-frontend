"use client";
import { useBridge } from "@/hooks/useBridge";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import { calculateDestinationAmount, formatDisplayAmount, isValidNumberInput } from "../utils/numberUtils";


interface BridgeCPYProps {
  handleNext: () => void;
  handleConnectWallet?: () => void;
}

export default function BridgeCPY({ handleNext, handleConnectWallet }: BridgeCPYProps) {
  const [sourceChain, setSourceChain] = useState("Polygon");
  const [amount, setAmount] = useState("");
  const { address, isConnected } = useAccount();
  const { bridge, progress, error, txHash, bridgingMs, isReady, isOnPolygon, reset } = useBridge();

  const onBridge = async () => {
    const res = await bridge(amount);  // BridgeResult
    if (res.status === 'success') {
      handleNext();
      return;
    }
    if (res.status === 'userRejected') {
      // user cancelled: immediately re-enable UI & close modal
      reset();
      return;
    }
    // failed for another reason
    // you can show res.message; button will be re-enabled since progress != 'sending'
    console.error(res.message);
  };

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
          <button className="bridge-btn" onClick={handleConnectWallet}>
            {isConnected ? "Wallet Connected" : "Connect Wallet"}
          </button>

          <button className="next-btn" onClick={onBridge} disabled={!amount || !isConnected || !isReady || progress === 'sending' || progress === 'waitingBase'}
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
