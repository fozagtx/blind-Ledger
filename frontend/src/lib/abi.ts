// PayrollPool ABI - hand-maintained alongside the contract.
// If you change the Solidity surface, mirror it here.
export const payrollPoolAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_token", type: "address" },
      { name: "_periodInterval", type: "uint256" },
    ],
    stateMutability: "nonpayable",
  },

  // Admin
  {
    type: "function",
    name: "depositFunds",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addPayee",
    inputs: [
      { name: "payee", type: "address" },
      {
        name: "encAmount",
        type: "tuple",
        components: [
          { name: "ctHash", type: "uint256" },
          { name: "securityZone", type: "uint8" },
          { name: "utype", type: "uint8" },
          { name: "signature", type: "bytes" },
        ],
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removePayee",
    inputs: [{ name: "payee", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setKeeper",
    inputs: [
      { name: "keeper", type: "address" },
      { name: "allowed", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "setPeriodInterval",
    inputs: [{ name: "newInterval", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // Period
  { type: "function", name: "advancePeriod", inputs: [], outputs: [], stateMutability: "nonpayable" },

  // Payee
  { type: "function", name: "requestClaim", inputs: [], outputs: [], stateMutability: "nonpayable" },
  { type: "function", name: "finalizeClaim", inputs: [], outputs: [], stateMutability: "nonpayable" },

  // Views
  { type: "function", name: "owner", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "token", inputs: [], outputs: [{ type: "address" }], stateMutability: "view" },
  { type: "function", name: "currentPeriod", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "lastPeriodAt", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "periodInterval", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  { type: "function", name: "nextPeriodAt", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  {
    type: "function",
    name: "keepers",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPayeeEncryptedAmount",
    inputs: [{ name: "payee", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAggregatePayroll",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  { type: "function", name: "getPayeeCount", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" },
  {
    type: "function",
    name: "getPayeeAt",
    inputs: [{ name: "i", type: "uint256" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRemainingBalance",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPayeeStatus",
    inputs: [{ name: "payee", type: "address" }],
    outputs: [
      { name: "exists", type: "bool" },
      { name: "requested", type: "bool" },
      { name: "claimed", type: "bool" },
      { name: "ready", type: "bool" },
      { name: "period", type: "uint256" },
    ],
    stateMutability: "view",
  },

  // Events
  {
    type: "event",
    name: "FundsDeposited",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  { type: "event", name: "PayeeAdded", inputs: [{ name: "payee", type: "address", indexed: true }], anonymous: false },
  { type: "event", name: "PayeeRemoved", inputs: [{ name: "payee", type: "address", indexed: true }], anonymous: false },
  {
    type: "event",
    name: "ClaimRequested",
    inputs: [
      { name: "payee", type: "address", indexed: true },
      { name: "period", type: "uint256", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SalaryClaimed",
    inputs: [
      { name: "payee", type: "address", indexed: true },
      { name: "period", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PeriodAdvanced",
    inputs: [
      { name: "newPeriod", type: "uint256", indexed: true },
      { name: "by", type: "address", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "KeeperSet",
    inputs: [
      { name: "keeper", type: "address", indexed: true },
      { name: "allowed", type: "bool", indexed: false },
    ],
    anonymous: false,
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
  },
  { type: "function", name: "decimals", inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view" },
  { type: "function", name: "symbol", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" },
] as const;
