// components/LockCardFromSchedule.tsx
'use client';

import React from 'react';
import LockCard from './LockCard';
import type { LockCardProps } from './LockCard';
import { useReleaseVested } from '@/hooks/useReleaseVested';
import { durationLabelFromStartAndCliff, formatThousands, formatToken } from '@/utils/helper';
import { FriendlyError } from "@/utils/evmError";
import { useToast } from "@/hooks/useToast";

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
		// ---- minimal fields you definitely have (per error) ----
		cliff: bigint;
		duration: bigint;
		slicePeriodSeconds: bigint;
		amountTotal: bigint;
		released: bigint;
		revoked: boolean;

		// ---- make these optional (missing in your current data) ----
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
	const { release, isClaiming } = useReleaseVested();
	const { showToast } = useToast();

	// Prefer amountLockedX if present; otherwise fall back to amountTotal
	const lockedAmount = item.raw.amountLockedX ?? item.raw.amountTotal;

	const amountCBY = formatToken(lockedAmount, 18) ?? '0';
	const lockPeriodLabel = durationLabelFromStartAndCliff(item.raw.start, item.raw.cliff);
	const totalSeed = item.totalFormatted ?? '0';
	const claimable = item.claimableFormatted ?? '0';
	const displayId = `#${String((index ?? 0) + 1).padStart(3, '0')}`;

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
					const rc = await release(vestingAddress, item.id);

					console.log('release response', { rc });
					// toast.success('Claim complete!');
				} catch (err: unknown) {
					// Narrow unknown → FriendlyError
					const e = err as FriendlyError;

					console.log('release error', { e });
					showToast({ type: 'error', message: e.userMessage ?? 'Something went wrong. Please try again.' });

					// toast.error(e.userMessage ?? 'Something went wrong. Please try again.');
				}
			},
	};

	return <LockCard {...props} />;
}
