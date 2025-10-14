// components/Bridge.tsx

import React, { useState, useEffect } from "react";
import Stepper from "./Stepper";
import BridgeCPY from "./BridgeCPY";
import SetStacking, { SetStackingDraft } from "./SetStacking";
import Review from "./Review";
import Success from "./Success";

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance?: string;
  handleConnectWallet?: () => void;
  /** Called after the final on-chain action completes successfully */
  onSuccess?: () => void;
}

const Bridge: React.FC<BridgeModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}) => {
  const steps = ["Connect Wallet", "Bridge CBY", "Set Staking Terms", "Review & Confirm"];
  const [currentStep, setCurrentStep] = useState(1);
  const [wasCompleted, setWasCompleted] = useState(false);

  // shared staking data
  const INITIAL_DRAFT: SetStackingDraft = {
    amountCBY: "",
    lockSeconds: 1 * 86400,
    lockPeriodLabel: "1 Month",
    unlockDateText: "",
    totalSeedToReceive: "0",
    claimableSeed: "0",
    swapRatioLabel: "1 $CBY = 1.0 $SEED",
    displayId: "#001",
  };

  const [draft, setDraft] = useState<SetStackingDraft>(() => ({ ...INITIAL_DRAFT }));
  const resetDraft = React.useCallback(() => setDraft({ ...INITIAL_DRAFT }), []);

  useEffect(() => {
    if (isOpen && wasCompleted) {
      setCurrentStep(1);
      setWasCompleted(false);
    }
  }, [isOpen, wasCompleted]);

  const handleNext = () => {
    setCurrentStep((s) => s + 1)
  };
  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));


  // Define the success handler
  const handleFlowSuccess = async () => {
    onSuccess?.();
  };

  const handleClose = () => {
    if (currentStep === 4) setWasCompleted(true);
    resetDraft();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bridge-modal-overlay">
      <div className="bridge-modal">
        {currentStep > 1 && currentStep < 4 && (
          <button type="button" className="back-button" onClick={handleBack} aria-label="Go back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <button className="close-button" onClick={handleClose}>×</button>

        {currentStep === 1 && (
          <BridgeCPY handleNext={handleNext} currentStep={currentStep} onSuccess={onSuccess} availableBalance={availableBalance} />
        )}

        {currentStep === 2 && (
          <SetStacking
            value={draft}
            onChange={setDraft}
            handleNext={handleNext}
            handleBack={handleBack}
            availableBalance={availableBalance}
          />
        )}

        {currentStep === 3 && (
          <Review
            displayId={draft.displayId}
            amountCBY={draft.amountCBY}
            totalSeedToReceive={draft.totalSeedToReceive}
            claimableSeed={draft.claimableSeed}
            lockPeriodLabel={draft.lockPeriodLabel}
            swapRatioLabel={draft.swapRatioLabel}
            unlockDateText={draft.unlockDateText}
            // final action happens here; call this when tx succeeds:
            onSuccess={handleFlowSuccess}
            stakeParams={{ amountCBY: draft.amountCBY, lockSeconds: draft.lockSeconds }}
            handleBack={handleBack}
            handleNext={handleNext} // keep if you also navigate manually elsewhere
          />
        )}

        {currentStep === 4 && <Success onClose={handleClose} />}

        <Stepper steps={steps} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default Bridge;
