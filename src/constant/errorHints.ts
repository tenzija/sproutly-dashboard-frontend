// src/constants/errorHints.ts
export const VESTING_HINTS = [
	{
		match: /TokenVesting:\s*not started/i,
		message: 'Vesting hasn’t started yet.',
	},
	{
		match: /TokenVesting:\s*nothing to release/i,
		message: 'Nothing to claim right now.',
	},
	{ match: /TokenVesting:\s*revoked/i, message: 'This lock was cancelled.' },
	{
		match: /TokenVesting:\s*startDate not set/i,
		message: 'Vesting schedule is not configured yet.',
	},
	{
		match: /insufficient reward funds/i,
		message: 'Rewards vault is empty right now.',
	},
];
