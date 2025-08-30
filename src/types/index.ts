// Asset Types
export interface Asset {
  symbol: string
  name: string
  address: string
  decimals: number
  priceDecimals: number
  minLeverage: number
  maxLeverage: number
  defaultLeverage: number
  price?: number
  change24h?: number
  volume24h?: number
}

// Position Types
export interface Position {
  id: string
  asset: string
  collateral: number
  leverage: number
  isLong: boolean
  entryPrice: number
  currentPrice: number
  size: number
  pnl: number
  pnlPercentage: number
  liquidationPrice: number
  marginRatio: number
  timestamp: number
}

// Market Data Types
export interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  fundingRate: number
  openInterest: number
  availableLiquidity: number
}

// Risk Level Types
export type RiskLevel = 'Conservative' | 'Moderate' | 'Aggressive'

export interface RiskLevelConfig {
  name: string
  maxLeverage: number
  color: string
  bgColor: string
  description: string
}

// Calculation Result Types
export interface LiquidationCalculation {
  liquidationPrice: number
  distanceToLiquidation: number
  distancePercentage: number
  marginRatio: number
  riskLevel: RiskLevel
}

export interface PnLCalculation {
  scenarios: Array<{
    priceChange: number
    price: number
    pnl: number
    pnlPercentage: number
    roi: number
  }>
  breakevenPrice: number
}

export interface FeeCalculation {
  timeframes: Array<{
    label: string
    hours: number
    positionFee: number
    borrowingFee: number
    fundingFee: number
    totalFees: number
  }>
  totalFees24h: number
}

export interface LeverageRecommendation {
  recommendedLeverage: number
  riskLevel: RiskLevel
  volatility: number
  maxSafeLeverage: number
  reasoning: string
}

export interface RiskRewardCalculation {
  riskRewardRatio: number
  expectedValue: number
  probabilityOfProfit: number
  maxLoss: number
  maxProfit: number
  recommendation: string
}

// Wallet Types
export interface WalletState {
  isConnected: boolean
  address?: string
  chainId?: number
  balance?: number
  positions: Position[]
}

// API Response Types
export interface GMXPriceResponse {
  [symbol: string]: {
    price: string
    timestamp: number
  }
}

export interface GMXFundingRateResponse {
  [symbol: string]: {
    fundingRate: string
    timestamp: number
  }
}

export interface GMXPositionResponse {
  id: string
  account: string
  indexToken: string
  collateralToken: string
  collateralDelta: string
  sizeDelta: string
  isLong: boolean
  fee: string
  timestamp: number
}

// UI State Types
export interface CalculatorState {
  asset: string
  collateral: number
  leverage: number
  isLong: boolean
  entryPrice: number
  currentPrice: number
}

export interface SimulationState {
  priceChange: number
  stopLoss: number
  takeProfit: number
  timeframes: number[]
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

// Chart Types
export interface ChartDataPoint {
  price: number
  pnl: number
  timestamp: number
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area'
  data: ChartDataPoint[]
  xAxis: string
  yAxis: string
  color: string
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  riskTolerance: RiskLevel
  defaultCollateral: number
  defaultLeverage: number
  notifications: {
    liquidation: boolean
    priceAlerts: boolean
    fundingRates: boolean
  }
  currency: 'USD' | 'EUR' | 'JPY'
}

// Export/Import Types
export interface CalculationExport {
  timestamp: number
  calculatorState: CalculatorState
  results: {
    liquidation: LiquidationCalculation
    pnl: PnLCalculation
    fees: FeeCalculation
    leverage: LeverageRecommendation
    riskReward: RiskRewardCalculation
  }
}

// Hook Return Types
export interface UseGMXDataReturn {
  marketData: MarketData[]
  loading: boolean
  error: AppError | null
  refetch: () => void
}

export interface UseWalletReturn {
  wallet: WalletState
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
}

export interface UseRiskCalculationsReturn {
  liquidation: LiquidationCalculation | null
  pnl: PnLCalculation | null
  fees: FeeCalculation | null
  leverage: LeverageRecommendation | null
  riskReward: RiskRewardCalculation | null
  calculate: (params: CalculatorState) => void
  loading: boolean
  error: AppError | null
}
