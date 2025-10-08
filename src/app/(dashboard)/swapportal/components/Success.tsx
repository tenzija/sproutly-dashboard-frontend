import Image from "next/image";
import React from "react";
import { useActiveLocks } from '@/hooks/useActiveLocks';

export interface SuccessProps {
  onClose: () => void;
}
function Success({ onClose }: SuccessProps) {

  const { refetch } = useActiveLocks({
    vestingAddress: process.env.NEXT_PUBLIC_VESTING!,
    chainId: 8453,
    tokenDecimals: 18,
  });

  const handleViewActiveLocks = async () => {
    try {
      await refetch();   // refresh the list
    } finally {
      onClose();         // then close the modal
    }
  };
  return (
    <div className="success-card">
      <Image
        src="/images/Frame 141.png"
        alt="success"
        className="success-card__image"
        width={144}
        height={144}
      />
      <h2 className="success-card__title" >Successfully Initiated!</h2>
      <p className="success-card__message">
        Your $CBY lock has been successfully initiated! You can now view its
        status and progress, along with all your other active locks, in the
        &apos;Your Active Locks&apos; section on the main Swap Portal page
      </p>
      <button className="success-card__button" onClick={handleViewActiveLocks}>View My Active Locks</button>
    </div>
  );
}

export default Success;
