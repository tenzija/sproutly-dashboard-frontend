import Image from "next/image";
import React from "react";

function Success({handleNext}:any) {
  return (
    <div className="success-card">
      <Image
        src="/images/Frame 141.png"
        alt="success"
        className="success-card__image"
          width={144}
              height={144}
      />
      <h2 className="success-card__title">Successfully Initiated!</h2>
      <p className="success-card__message">
        Your $CBY lock has been successfully initiated! You can now view its
        status and progress, along with all your other active locks, in the
        'Your Active Locks' section on the main Swap Portal page
      </p>
      <button className="success-card__button">View My Active Locks</button>
    </div>
  );
}

export default Success;
