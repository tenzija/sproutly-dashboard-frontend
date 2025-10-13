import React from "react";
import Skeleton from "@mui/material/Skeleton";

export function LockCardSkeleton() {
    return (
        <>
            <div className="relative w-full rounded-[20px] bg-[url('/images/bg1.jpg')] bg-cover bg-center bg-no-repeat p-5 md:p-4">
                <div className="w-full rounded-[16px] border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] p-6 gap-4">
                    {/* Header */}
                    <div className="flex flex-col items-start mb-6 w-full">
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="text" width={220} height={36} />
                    </div>

                    {/* Details Row */}
                    <div className="flex justify-between mb-5 gap-4">
                        <div className="flex flex-col items-center flex-1">
                            <Skeleton variant="text" width={80} height={18} />
                            <Skeleton variant="text" width={100} height={24} />
                        </div>

                        <div className="flex flex-col items-center flex-1 border-l border-r border-[rgba(255,255,255,0.09)] px-4">
                            <Skeleton variant="text" width={160} height={18} />
                            <Skeleton variant="text" width={120} height={24} />
                        </div>

                        <div className="flex flex-col items-center flex-1">
                            <Skeleton variant="text" width={110} height={18} />
                            <Skeleton variant="text" width={100} height={24} />
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-4">
                        <Skeleton variant="text" width={160} height={18} />
                        <div className="flex items-center mt-2">
                            <Skeleton variant="rectangular" height={12} className="rounded-[6px] w-full mr-3" />
                            <Skeleton variant="text" width={32} height={18} />
                        </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="mb-4">
                        <Skeleton variant="text" width={120} height={18} />
                        <Skeleton variant="text" width={180} height={24} />
                    </div>

                    {/* Button */}
                    <Skeleton
                        variant="rounded"
                        width={180}
                        height={40}
                        className="rounded-[20px]"
                    />
                </div>
            </div>
            <div className="relative w-full rounded-[20px] bg-[url('/images/bg1.jpg')] bg-cover bg-center bg-no-repeat p-5 md:p-4">
                <div className="w-full rounded-[16px] border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] p-6 gap-4">
                    {/* Header */}
                    <div className="flex flex-col items-start mb-6 w-full">
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="text" width={220} height={36} />
                    </div>

                    {/* Details Row */}
                    <div className="flex justify-between mb-5 gap-4">
                        <div className="flex flex-col items-center flex-1">
                            <Skeleton variant="text" width={80} height={18} />
                            <Skeleton variant="text" width={100} height={24} />
                        </div>

                        <div className="flex flex-col items-center flex-1 border-l border-r border-[rgba(255,255,255,0.09)] px-4">
                            <Skeleton variant="text" width={160} height={18} />
                            <Skeleton variant="text" width={120} height={24} />
                        </div>

                        <div className="flex flex-col items-center flex-1">
                            <Skeleton variant="text" width={110} height={18} />
                            <Skeleton variant="text" width={100} height={24} />
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-4">
                        <Skeleton variant="text" width={160} height={18} />
                        <div className="flex items-center mt-2">
                            <Skeleton variant="rectangular" height={12} className="rounded-[6px] w-full mr-3" />
                            <Skeleton variant="text" width={32} height={18} />
                        </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="mb-4">
                        <Skeleton variant="text" width={120} height={18} />
                        <Skeleton variant="text" width={180} height={24} />
                    </div>

                    {/* Button */}
                    <Skeleton
                        variant="rounded"
                        width={180}
                        height={40}
                        className="rounded-[20px]"
                    />
                </div>
            </div>
        </>
    );
}
