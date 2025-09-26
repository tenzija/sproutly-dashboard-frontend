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
}

const Bridge: React.FC<BridgeModalProps> = ({
  isOpen,
  onClose,
  availableBalance,
  handleConnectWallet,
}) => {
  const steps = ["Connect Wallet", "Bridge CBY", "Set Staking Terms", "Review & Confirm"];
  const [currentStep, setCurrentStep] = useState(2);
  const [wasCompleted, setWasCompleted] = useState(false);

  // 🔹 lifted shared staking data (edited in SetStacking, displayed/used in Review)
  const [draft, setDraft] = useState<SetStackingDraft>({
    amountCBY: "0",
    lockSeconds: 30 * 86400, // default 1 Month
    lockPeriodLabel: "1 Month",
    unlockDateText: "",
    totalSeedToReceive: "0",
    claimableSeed: "0",
    swapRatioLabel: "1 $CBY = 1.0 $SEED",
    displayId: "#001",
  });

  useEffect(() => {
    if (isOpen && wasCompleted) {
      setCurrentStep(1);
      setWasCompleted(false);
    }
  }, [isOpen, wasCompleted]);

  const handleClose = () => {
    if (currentStep === 4) setWasCompleted(true);
    onClose();
  };

  if (!isOpen) return null;

  const handleNext = () => setCurrentStep((s) => s + 1);
  const handleBack = () => setCurrentStep((s) => Math.max(1, s - 1));

  return (
    <div className="bridge-modal-overlay">
      <div className="bridge-modal">
        <button className="close-button" onClick={handleClose}>×</button>

        {currentStep === 1 && (
          <BridgeCPY handleNext={handleNext} handleConnectWallet={handleConnectWallet} />
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
            // final action happens here
            stakeParams={{ amountCBY: draft.amountCBY, lockSeconds: draft.lockSeconds }}
            handleBack={handleBack}
            handleNext={handleNext}
          />
        )}

        {currentStep === 4 && <Success />}

        <Stepper steps={steps} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default Bridge;
