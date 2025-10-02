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
					{ internalType: 'uint256', name: 'amountLockedX', type: 'uint256' },
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

	// claim vested tokens
	{
		type: 'function',
		name: 'claim',
		stateMutability: 'nonpayable',
		inputs: [],
		outputs: [],
	},

	// how much the user can claim right now
	{
		type: 'function',
		name: 'claimable',
		stateMutability: 'view',
		inputs: [{ name: 'user', type: 'address' }],
		outputs: [{ name: '', type: 'uint256' }],
	},

	// optional: full lock info (amount, start, end, claimed)
	{
		type: 'function',
		name: 'getUserLock',
		stateMutability: 'view',
		inputs: [{ name: 'user', type: 'address' }],
		outputs: [
			{ name: 'amount', type: 'uint256' },
			{ name: 'start', type: 'uint64' },
			{ name: 'end', type: 'uint64' },
			{ name: 'claimed', type: 'uint256' },
		],
	},
] as const;

export const mockWormholeBridgeAbi = [
	{
		type: 'function',
		name: 'crossChainId',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ type: 'uint16' }],
	},
	{
		type: 'function',
		name: 'crossChainCounterParty',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ type: 'address' }],
	},
	{
		type: 'function',
		name: 'MIN_GAS_LIMIT',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ type: 'uint256' }],
	},
	{
		type: 'function',
		name: 'quoteCrossChainCall',
		stateMutability: 'view',
		inputs: [{ type: 'uint16' }, { type: 'uint256' }],
		outputs: [{ type: 'uint256' }],
	},
	{
		type: 'function',
		name: 'sendCrossChainDeposit',
		stateMutability: 'payable',
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'amount', type: 'uint256' },
			{ name: 'extraGas', type: 'uint256' },
		],
		outputs: [],
	},
	// events
	{
		type: 'event',
		name: 'Deposit',
		inputs: [
			{ indexed: true, name: 'from', type: 'address' },
			{ indexed: false, name: 'amount', type: 'uint256' },
		],
	},
	{
		type: 'event',
		name: 'Withdraw',
		inputs: [
			{ indexed: true, name: 'to', type: 'address' },
			{ indexed: false, name: 'amount', type: 'uint256' },
		],
	},
] as const;

export const vaultUnlimitedAbi = [
	{
		type: 'event',
		name: 'Withdrawn',
		inputs: [
			{ indexed: true, name: 'to', type: 'address' },
			{ indexed: false, name: 'amount', type: 'uint256' },
		],
	},
] as const;

export const erc20Abi = [
	{
		type: 'function',
		name: 'decimals',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ type: 'uint8' }],
	},
	{
		type: 'function',
		name: 'balanceOf',
		stateMutability: 'view',
		inputs: [{ type: 'address' }],
		outputs: [{ type: 'uint256' }],
	},
	{
		type: 'function',
		name: 'allowance',
		stateMutability: 'view',
		inputs: [{ type: 'address' }, { type: 'address' }],
		outputs: [{ type: 'uint256' }],
	},
	{
		type: 'function',
		name: 'approve',
		stateMutability: 'nonpayable',
		inputs: [{ type: 'address' }, { type: 'uint256' }],
		outputs: [{ type: 'bool' }],
	},
] as const;
