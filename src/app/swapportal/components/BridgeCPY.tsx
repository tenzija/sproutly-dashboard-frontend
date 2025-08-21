import React, { useState } from "react";

function BridgeCPY(handleNext:any) {
  const [sourceChain, setSourceChain] = useState("Ethereum Mainnet");
  const [amount, setAmount] = useState("");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };


  const calculateDestinationAmount = (sourceAmount: string) => {
    const numAmount = parseFloat(sourceAmount);
    return isNaN(numAmount) ? "2500" : Math.floor(numAmount * 0.2).toString();
  };
  return (
    <>
      <div className="modal-header">
        <h1 className="modal-title">Bridge Your $CBY Tokens</h1>
        <p className="modal-subtitle">
          Your $CBY tokens must be on the BASE chain to proceed with this swap.
          <br />
          Select your source chain below to initiate the bridge
        </p>
      </div>

      <div className="modal-content">
        <div className="form-row">
          <div className="form-group">
            <label>Source Chain</label>
            <div className="select-wrapper">
              <select
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
                className="chain-select"
              >
                <option value="Ethereum Mainnet">Ethereum Mainnet</option>
                <option value="Polygon">Polygon</option>
                <option value="Arbitrum">Arbitrum</option>
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
              onChange={handleAmountChange}
              className="amount-input"
            />
            <p className="fee-info">
              Estimated Bridging Fee: ~0.005 ETH
              <span className="info-icon">ⓘ</span>
            </p>
          </div>
        </div>

        <div className="bridge-cards">
          <div className="bridge-card source-card">
            <div className="card-header">Source Chain</div>
            <div className="card-amount">
              {amount || "12500"} <span className="token">$CBY</span>
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
          <button className="bridge-btn disabled">Bridge</button>
          <button className="next-btn" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    </>
  );
}

export default BridgeCPY;
