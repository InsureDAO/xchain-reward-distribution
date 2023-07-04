export const rootGaugeFactory = [
  {
    inputs: [],
    name: 'call_proxy',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_future_owner', type: 'address' },
    ],
    name: 'commit_transfer_ownership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_chain_id', type: 'uint256' },
      { internalType: 'address', name: '_lp_token', type: 'address' },
      { internalType: 'bytes32', name: '_salt', type: 'bytes32' },
    ],
    name: 'deploy_child_gauge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_chain_id', type: 'uint256' },
      { internalType: 'bytes32', name: '_salt', type: 'bytes32' },
    ],
    name: 'deploy_gauge',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_chain_id', type: 'uint256' },
      { internalType: 'address', name: '_bridger', type: 'address' },
    ],
    name: 'set_bridger',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_new_call_proxy', type: 'address' },
    ],
    name: 'set_call_proxy',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_implementation', type: 'address' },
    ],
    name: 'set_implementation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_gauge', type: 'address' }],
    name: 'transmit_emissions',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
