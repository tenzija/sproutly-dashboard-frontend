// abis/tokenVesting.ts
export const tokenVestingAbi = [
	{
		type: 'function',
		name: 'getCalculationLayer',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ type: 'address' }],
	},
	{
		type: 'function',
		name: 'startDate',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ type: 'uint256' }],
	},
	{
		type: 'function',
		name: 'createVestingSchedule',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'beneficiary', type: 'address' },
			{ name: 'cliffDuration', type: 'uint256' },
			{ name: 'slicePeriodSeconds', type: 'uint256' },
			{ name: 'duration', type: 'uint256' },
			{ name: 'revocable', type: 'bool' },
			{ name: 'amountLockedX', type: 'uint256' },
		],
		outputs: [],
	},
] as const;

// abis/calculationLayer.ts
export const calculationLayerAbi = [
	{
		type: 'function',
		name: 'calculateUserRatio',
		stateMutability: 'view',
		inputs: [
			{ name: 'daysLocked', type: 'uint256' },
			{ name: 'base', type: 'uint256' }, // you pass 1
		],
		outputs: [{ type: 'uint256' }], // scaled by 1e18
	},
] as const;
