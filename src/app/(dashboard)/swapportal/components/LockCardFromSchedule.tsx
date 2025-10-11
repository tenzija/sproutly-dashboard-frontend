import React, { useEffect, useRef, useState } from 'react';
import LockCard from './LockCard';
import type { LockCardProps } from './LockCard';
import { useReleaseVested } from '@/hooks/useReleaseVested';
import { useActiveLocks } from '@/hooks/useActiveLocks';
import { useToast } from '@/hooks/useToast';
import { FriendlyError } from '@/utils/evmError';
import {
	durationLabelFromStartAndCliff,
	formatThousands,
	formatToken,
} from '@/utils/helper';
import { toast } from "react-toastify";

export type VestingScheduleView = {
	amountTokenFormatted?: string;
	totalFormatted?: string;
	claimableFormatted?: string;
	unlockDateText?: string;
	timeRemainingText?: string;
	progressPct?: number;
	index?: number;
	id: `0x${string}`;
	claimableRaw: bigint;
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

export default function LockCardFromSchedule({ vestingAddress, item }: Props) {
	const [isClaiming, setIsClaiming] = useState(false);
	const [isClaimed, setIsClaimed] = useState(false);
	const { release } = useReleaseVested();
	const { refetch } = useActiveLocks({ vestingAddress });
	const { showToast } = useToast();

	// prevent state updates after unmount
	const mountedRef = useRef(true);
	useEffect(() => () => { mountedRef.current = false; }, []);

	// formatted values
	const amountCBY =
		formatToken(item.raw.amountLockedX ?? item.raw.amountTotal, 18) ?? '0';
	const lockPeriodLabel = durationLabelFromStartAndCliff(
		item.raw.start,
		item.raw.cliff
	);
	const totalSeed = item.totalFormatted ?? '0';
	const claimable = item.claimableFormatted ?? '0';
	const displayId = `#${String(item.index ?? 0).padStart(3, '0')}`;

	// post-claim progress
	const total = item.raw.amountTotal;
	const released = item.raw.released;
	const claimableRaw = item.claimableRaw ?? 0n;
	const afterClaimPct =
		total > 0n
			? Math.min(100, Number(((released + claimableRaw) * 100n) / total))
			: 0;

	const canClaimNow = !isClaiming && claimableRaw > 0n && !item.raw.revoked;

	const handleClaim = async () => {
		if (!canClaimNow) {
			if (claimableRaw === 0n) {
				showToast({ type: 'info', message: 'Nothing to claim yet.' });
			}
			return;
		}

		try {
			setIsClaiming(true);
			await release(vestingAddress, item.id);
			setIsClaimed(true);
			setIsClaiming(false);
			refetch();
			toast.success('Claim complete!');
		} catch (err) {
			setIsClaiming(false);
			const e = err as FriendlyError;
			toast.error(e.userMessage ?? 'Claim failed. Please try again.');
		} finally {
			if (mountedRef.current) setIsClaiming(false);
		}
	};

	const props: LockCardProps = {
		displayId,
		amountCBY: formatThousands(amountCBY),
		lockPeriodLabel,
		totalSeedToReceive: formatThousands(totalSeed),
		claimableSeed: formatThousands(claimable),
		unlockDateText: item.unlockDateText ?? '',
		progressPct: item.progressPct ?? 0,
		timeRemainingText: item.timeRemainingText ?? '',
		onClaim: handleClaim,
		isClaiming,
	};

	// ⬇️ keep this exactly as you asked
	return (
		<div className={afterClaimPct === 100 && isClaimed ? 'hidden' : ''}> {/* Hide card if progress is 100% or if it's claimed */}
			<LockCard {...props} />
		</div>
	);
}
