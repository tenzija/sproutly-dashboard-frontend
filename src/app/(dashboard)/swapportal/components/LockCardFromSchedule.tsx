import React, { useState } from 'react';
import LockCard from './LockCard';
import type { LockCardProps } from './LockCard';
import { useReleaseVested } from '@/hooks/useReleaseVested';
import { useActiveLocks } from "@/hooks/useActiveLocks";
import { useToast } from "@/hooks/useToast";
import { FriendlyError } from "@/utils/evmError";
import { durationLabelFromStartAndCliff, formatThousands, formatToken } from '@/utils/helper';

export type VestingScheduleView = {
	amountTokenFormatted?: string;
	totalFormatted?: string;
	claimableFormatted?: string;
	unlockDateText?: string;
	timeRemainingText?: string;
	progressPct?: number;
	index?: number;
	id: `0x${string}`;
	raw: {
		cliff: bigint;
		duration: bigint;
		slicePeriodSeconds: bigint;
		amountTotal: bigint;
		released: bigint;
		revoked: boolean;
		beneficiary?: `0x${string}`;
		start: bigint;
		revocable?: boolean;
		amountLockedX?: bigint;
	};
};

type Props = {
	vestingAddress: `0x${string}`;
	item: VestingScheduleView;
	index: number;
};

export default function LockCardFromSchedule({ vestingAddress, item, index }: Props) {
	const [isClaiming, setIsClaiming] = useState(false); // Track the claiming state
	const [isClaimed, setIsClaimed] = useState(false); // Track if the card is claimed
	const { release } = useReleaseVested();
	const { refetch } = useActiveLocks({ vestingAddress });
	const { showToast } = useToast();

	// Prepare the props for LockCard
	const amountCBY = formatToken(item.raw.amountLockedX ?? item.raw.amountTotal, 18) ?? '0';
	const lockPeriodLabel = durationLabelFromStartAndCliff(item.raw.start, item.raw.cliff);
	const totalSeed = item.totalFormatted ?? '0';
	const claimable = item.claimableFormatted ?? '0';
	const displayId = `#${String((index ?? 0) + 1).padStart(3, '0')}`;

	console.log("item in LockCardFromSchedule:", item.raw);
	const props: LockCardProps = {
		displayId,
		amountCBY: formatThousands(amountCBY),
		lockPeriodLabel,
		totalSeedToReceive: formatThousands(totalSeed),
		claimableSeed: formatThousands(claimable),
		unlockDateText: item.unlockDateText ?? '',
		progressPct: item.progressPct ?? 0,
		timeRemainingText: item.timeRemainingText ?? '',
		onClaim: isClaiming
			? undefined
			: async () => {
				try {
					setIsClaiming(true); // Set claiming state to true

					await release(vestingAddress, item.id);

					// Mark as claimed after successful claim
					setIsClaimed(true);

					refetch(); // Trigger a refetch to update data
					showToast({ type: 'success', message: 'Claim complete!' });
				} catch (err: unknown) {
					const e = err as FriendlyError;
					console.log('release error', { e });
					showToast({ type: 'error', message: e.userMessage ?? 'Something went wrong. Please try again.' });
				} finally {
					setIsClaiming(false); // Reset claiming state after completion
				}
			},
	};

	return (
		<div className={item.progressPct === 100 || isClaimed ? 'hidden' : ''}> {/* Hide card if progress is 100% or if it's claimed */}
			<LockCard {...props} />
		</div>
	);
}
