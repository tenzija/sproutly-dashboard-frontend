import React, { useState } from "react";
import Stepper from "./Stepper";
import BridgeCPY from "./BridgeCPY";
import SetStacking from "./SetStacking";
import Review from "./Review";
import Success from "./Success";

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Bridge: React.FC<BridgeModalProps> = ({ isOpen, onClose }) => {
  const steps = [
    "Connect Wallet",
    "Bridge CBY",
    "Set Staking Terms",
    "Review & Confirm",
  ];
  const [currentStep, setCurrentStep] = useState(1);
  
  if (!isOpen) return null;
  
  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  return (
    <div className="bridge-modal-overlay">
      <div className="bridge-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        {currentStep === 1 && <BridgeCPY handleNext={handleNext} />}
        {currentStep === 2 && <SetStacking handleNext={handleNext} />}
        {currentStep === 3 && <Success />}
        {currentStep === 4 && <Review handleNext={handleNext} />}
        <Stepper steps={steps} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default Bridge;
