import React from "react";
import "./Stepper.scss";

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="stepper">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div className="stepper__step" key={index}>
            <div
              className={`stepper__circle ${
                isCompleted ? "completed" : isActive ? "active" : ""
              }`}
            >
              {isCompleted ? "✓" : ""}
            </div>
            <div
              className={`stepper__label ${
                isActive ? "active-label" : ""
              }`}
            >
              {step}
            </div>
            {index !== steps.length - 1 && (
              <div
                className={`stepper__line ${
                  isCompleted ? "line-completed" : ""
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
