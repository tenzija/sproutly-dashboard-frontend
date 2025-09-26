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
	{
		inputs: [{ internalType: 'address', name: 'beneficiary', type: 'address' }],
		name: 'getVestingSchedulesCountByBeneficiary',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ internalType: 'address', name: 'beneficiary', type: 'address' },
			{ internalType: 'uint256', name: 'index', type: 'uint256' },
		],
		name: 'getVestingScheduleByAddressAndIndex',
		outputs: [
			{
				components: [
					{ internalType: 'address', name: 'beneficiary', type: 'address' },
					{ internalType: 'uint256', name: 'cliff', type: 'uint256' },
					{ internalType: 'uint256', name: 'start', type: 'uint256' },
					{ internalType: 'uint256', name: 'duration', type: 'uint256' },
					{
						internalType: 'uint256',
						name: 'slicePeriodSeconds',
						type: 'uint256',
					},
					{ internalType: 'bool', name: 'revocable', type: 'bool' },
					{ internalType: 'uint256', name: 'amountTotal', type: 'uint256' },
					{ internalType: 'uint256', name: 'released', type: 'uint256' },
					{ internalType: 'bool', name: 'revoked', type: 'bool' },
				],
				internalType: 'struct TokenVesting.VestingSchedule',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
		name: 'computeReleasableAmount',
		outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'bytes32',
				name: 'id',
				type: 'bytes32',
			},
		],
		name: 'release',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
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
