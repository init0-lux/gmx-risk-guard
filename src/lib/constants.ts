// Avalanche Network Configuration
export const AVALANCHE_CONFIG = {
  chainId: 43114,
  name: 'Avalanche C-Chain',
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  explorer: 'https://snowtrace.io',
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
} as const

// GMX V2 Contract Addresses (Avalanche)
export const GMX_CONTRACTS = {
  router: '0x5F719c2F1095F7B9fc68a68e35B51194f4abEe20',
  vault: '0x489ee077994B6658eAfA855C308275EAd8097C4A',
  positionRouter: '0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868',
  orderBook: '0x09f77E8A13De9a35a7231028187e9fD5db8a2ACB',
  referralStorage: '0xE6b7a5C8E4C3B9C8C8C8C8C8C8C8C8C8C8C8C8C8',
} as const

// Supported Assets
export const SUPPORTED_ASSETS = [
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    decimals: 18,
    priceDecimals: 8,
    minLeverage: 1,
    maxLeverage: 50,
    defaultLeverage: 5,
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    address: '0x50b7545627a5162F82A992c33b87aDc75187B218',
    decimals: 8,
    priceDecimals: 8,
    minLeverage: 1,
    maxLeverage: 50,
    defaultLeverage: 3,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
    decimals: 18,
    priceDecimals: 8,
    minLeverage: 1,
    maxLeverage: 50,
    defaultLeverage: 3,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    decimals: 6,
    priceDecimals: 8,
    minLeverage: 1,
    maxLeverage: 50,
    defaultLeverage: 5,
  },
] as const

// Risk Levels
export const RISK_LEVELS = {
  CONSERVATIVE: {
    name: 'Conservative',
    maxLeverage: 3,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    description: 'Low risk, suitable for beginners',
  },
  MODERATE: {
    name: 'Moderate',
    maxLeverage: 10,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    description: 'Balanced risk and reward',
  },
  AGGRESSIVE: {
    name: 'Aggressive',
    maxLeverage: 50,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    description: 'High risk, high reward potential',
  },
} as const

// Fee Structure (GMX V2)
export const FEE_STRUCTURE = {
  swapFee: 0.0005, // 0.05%
  positionFee: 0.0001, // 0.01%
  liquidationFee: 0.02, // 2%
  borrowingFee: 0.0001, // 0.01% per hour
  fundingRate: 0.0001, // 0.01% per hour (varies by asset)
} as const

// API Endpoints
export const API_ENDPOINTS = {
  gmxSubgraph: 'https://api.thegraph.com/subgraphs/name/gmx-io/gmx-avalanche',
  coingecko: 'https://api.coingecko.com/api/v3',
  gmxPrices: 'https://gmx-server-mainnet.uw.r.appspot.com/prices',
} as const

// UI Constants
export const UI_CONSTANTS = {
  maxLeverage: 50,
  minLeverage: 1,
  defaultCollateral: 1000,
  priceChangeScenarios: [5, 10, 20, 50],
  timeframes: [
    { label: '1 Hour', value: 1 },
    { label: '1 Day', value: 24 },
    { label: '7 Days', value: 168 },
    { label: '30 Days', value: 720 },
  ],
} as const

// Error Messages
export const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: 'Insufficient balance for this position',
  INVALID_LEVERAGE: 'Leverage must be between 1x and 50x',
  INVALID_COLLATERAL: 'Collateral amount must be greater than 0',
  NETWORK_ERROR: 'Network error. Please check your connection',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  POSITION_TOO_LARGE: 'Position size exceeds maximum allowed',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  POSITION_CREATED: 'Position created successfully',
  POSITION_CLOSED: 'Position closed successfully',
  CALCULATION_UPDATED: 'Calculation updated',
} as const
