import React, { useState, useEffect } from "react";
import Stepper from "./Stepper";
import BridgeCPY from "./BridgeCPY";
import SetStacking from "./SetStacking";
import Review from "./Review";
import Success from "./Success";

interface BridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  handleConnectWallet?: () => void;
}

const Bridge: React.FC<BridgeModalProps> = ({ isOpen, onClose, handleConnectWallet }) => {
  const steps = [
    "Connect Wallet",
    "Bridge CBY",
    "Set Staking Terms",
    "Review & Confirm",
  ];
  const [currentStep, setCurrentStep] = useState(1);
  const [wasCompleted, setWasCompleted] = useState(false);
  
  useEffect(() => {
    if (isOpen && wasCompleted) {
      setCurrentStep(1);
      setWasCompleted(false);
    }
  }, [isOpen, wasCompleted]);
  
  const handleClose = () => {
    if (currentStep === 4) { 
      setWasCompleted(true);
    }
    onClose();
  };
  
  if (!isOpen) return null;
  
  const handleNext = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => Math.max(1, prevStep - 1));
  };

  return (
    <div className="bridge-modal-overlay">
      <div className="bridge-modal">
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        {currentStep === 1 && <BridgeCPY handleNext={handleNext} handleConnectWallet={handleConnectWallet} />}
        {currentStep === 2 && <SetStacking handleNext={handleNext} handleBack={handleBack} />}
        {currentStep === 3 && <Review handleNext={handleNext} handleBack={handleBack} />}
        {currentStep === 4 && <Success />}
        <Stepper steps={steps} currentStep={currentStep} />
      </div>
    </div>
  );
};

export default Bridge;
