import React from 'react'

function LockCard() {
  return (
    <div className="lock-card-background">
      <div className="cby-seed-vesting">
        <div className="header">
          <span className="number">#001</span>
          <h2>10,000 $CBY</h2>
        </div>
        <div className="details">
          <div className="detail-item">
            <div className="label">Lock Period</div>
            <div className="value">12 Months</div>
          </div>
          <div className="detail-item">
            <div className="label">Total $SEED to be Received</div>
            <div className="value total-seed">12,000</div>
          </div>
          <div className="detail-item">
            <div className="label">Claimable $SEED</div>
            <div className="value claimable-seed">500</div>
          </div>
        </div>
        <div className="progress-section">
          <span className="date">September 8, 2025</span>

          <div className="date-progress">
            <span className="progress-bar-bg">
              <span
                className="progress-bar-fill"
                style={{ width: "25%" }}
              ></span>
            </span>
            <span className="progress-percent">25%</span>
          </div>
        </div>
        <div className="time-remaining">
          <div className="label">Time Remaining</div>
          <div className="value">11 Months, 15 Days</div>
        </div>
        <button className="claim-btn">Claim Vested $SEED</button>
      </div>
    </div>
  )
}

export default LockCard