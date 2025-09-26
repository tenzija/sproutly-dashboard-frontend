// components/LockCardFromSchedule.tsx
'use client';

import React from 'react';
import LockCard from './LockCard';
import type { LockCardProps } from './LockCard'; // ✅ type-only import

import { useReleaseVested } from '@/hooks/useReleaseVested';
import { durationLabelFromSeconds, formatThousands } from '@/utils/helper';

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
		beneficiary: `0x${string}`;
		start: bigint;
		cliff: bigint;
		duration: bigint;
		slicePeriodSeconds: bigint;
		amountTotal: bigint;
		released: bigint;
		revocable: boolean;
		revoked: boolean;
	};
};

type Props = {
	vestingAddress: `0x${string}`;
	item: VestingScheduleView;
	// onClaimed?: (id: `0x${string}`) => void;
};

export default function LockCardFromSchedule({
	vestingAddress,
	item,
	// onClaimed,
}: Props) {
	const { release, isClaiming } = useReleaseVested();

	const amountCBY = item.amountTokenFormatted ?? '0';
	const lockPeriodLabel = durationLabelFromSeconds(item.raw.duration);
	const totalSeed = item.totalFormatted ?? '0';
	const claimable = item.claimableFormatted ?? '0';
	const displayId = `#${String((item.index ?? 0) + 1).padStart(3, '0')}`;

	const props: LockCardProps = {
		displayId,
		amountCBY: formatThousands(amountCBY),
		lockPeriodLabel,
		totalSeedToReceive: formatThousands(totalSeed),
		claimableSeed: formatThousands(claimable),
		unlockDateText: item.unlockDateText ?? '',
		progressPct: item.progressPct ?? 0,
		timeRemainingText: item.timeRemainingText ?? '',
		onClaim: async () => {
			try {
				await release(vestingAddress, item.id);
				// onClaimed?.(item.id);
			} catch (e) {
				console.error(e);
			}
		},
	};

	return <LockCard {...props} />;
}
