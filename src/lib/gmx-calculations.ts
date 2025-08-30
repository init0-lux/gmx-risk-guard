import { FEE_STRUCTURE, SUPPORTED_ASSETS } from './constants'

export interface PositionParams {
  asset: string
  collateral: number
  leverage: number
  isLong: boolean
  entryPrice: number
}

export interface LiquidationResult {
  liquidationPrice: number
  distanceToLiquidation: number
  distancePercentage: number
  marginRatio: number
}

export interface PnLResult {
  pnl: number
  pnlPercentage: number
  roi: number
  breakevenPrice: number
}

export interface FeeResult {
  positionFee: number
  borrowingFee: number
  fundingFee: number
  totalFees: number
}

export interface RiskRewardResult {
  riskRewardRatio: number
  expectedValue: number
  probabilityOfProfit: number
  maxLoss: number
  maxProfit: number
}

/**
 * Calculate liquidation price for GMX V2 position
 * Based on GMX V2 liquidation logic
 */
export function calculateLiquidationPrice(params: PositionParams): LiquidationResult {
  const { asset, collateral, leverage, isLong, entryPrice } = params
  
  // Find asset configuration
  const assetConfig = SUPPORTED_ASSETS.find(a => a.symbol === asset)
  if (!assetConfig) {
    throw new Error(`Asset ${asset} not supported`)
  }

  const positionSize = collateral * leverage
  const marginRatio = 1 / leverage
  
  // GMX V2 liquidation threshold (varies by asset, using conservative estimate)
  const liquidationThreshold = 0.85 // 85% of margin
  
  let liquidationPrice: number
  
  if (isLong) {
    // For long positions: liquidation when price drops below threshold
    liquidationPrice = entryPrice * (1 - marginRatio * liquidationThreshold)
  } else {
    // For short positions: liquidation when price rises above threshold
    liquidationPrice = entryPrice * (1 + marginRatio * liquidationThreshold)
  }
  
  const distanceToLiquidation = Math.abs(entryPrice - liquidationPrice)
  const distancePercentage = (distanceToLiquidation / entryPrice) * 100
  
  return {
    liquidationPrice,
    distanceToLiquidation,
    distancePercentage,
    marginRatio: marginRatio * 100
  }
}

/**
 * Calculate PnL for a given price change
 */
export function calculatePnL(
  params: PositionParams,
  currentPrice: number
): PnLResult {
  const { collateral, leverage, isLong, entryPrice } = params
  
  const positionSize = collateral * leverage
  const priceChange = currentPrice - entryPrice
  const priceChangePercentage = (priceChange / entryPrice) * 100
  
  let pnl: number
  let pnlPercentage: number
  
  if (isLong) {
    pnl = positionSize * (priceChangePercentage / 100)
    pnlPercentage = priceChangePercentage * leverage
  } else {
    pnl = positionSize * (-priceChangePercentage / 100)
    pnlPercentage = -priceChangePercentage * leverage
  }
  
  const roi = (pnl / collateral) * 100
  
  // Calculate breakeven price (including fees)
  const totalFees = calculateTotalFees(params, 24).totalFees // 24 hours
  const breakevenPnL = totalFees
  const breakevenPriceChange = (breakevenPnL / positionSize) * 100
  
  let breakevenPrice: number
  if (isLong) {
    breakevenPrice = entryPrice * (1 + breakevenPriceChange / 100)
  } else {
    breakevenPrice = entryPrice * (1 - breakevenPriceChange / 100)
  }
  
  return {
    pnl,
    pnlPercentage,
    roi,
    breakevenPrice
  }
}

/**
 * Calculate fees for a position
 */
export function calculateTotalFees(
  params: PositionParams,
  hours: number
): FeeResult {
  const { collateral, leverage } = params
  
  const positionSize = collateral * leverage
  
  // Position fee (one-time)
  const positionFee = positionSize * FEE_STRUCTURE.positionFee
  
  // Borrowing fee (hourly)
  const borrowingFee = positionSize * FEE_STRUCTURE.borrowingFee * hours
  
  // Funding fee (hourly, varies by asset)
  const fundingFee = positionSize * FEE_STRUCTURE.fundingRate * hours
  
  const totalFees = positionFee + borrowingFee + fundingFee
  
  return {
    positionFee,
    borrowingFee,
    fundingFee,
    totalFees
  }
}

/**
 * Calculate risk/reward ratio
 */
export function calculateRiskReward(
  params: PositionParams,
  stopLoss: number,
  takeProfit: number
): RiskRewardResult {
  const { entryPrice, isLong } = params
  
  let maxLoss: number
  let maxProfit: number
  
  if (isLong) {
    maxLoss = Math.abs(entryPrice - stopLoss)
    maxProfit = Math.abs(takeProfit - entryPrice)
  } else {
    maxLoss = Math.abs(stopLoss - entryPrice)
    maxProfit = Math.abs(entryPrice - takeProfit)
  }
  
  const riskRewardRatio = maxProfit / maxLoss
  
  // Simplified probability calculation (can be enhanced with historical data)
  const probabilityOfProfit = 1 / (1 + riskRewardRatio)
  
  // Expected value calculation
  const expectedValue = (maxProfit * probabilityOfProfit) - (maxLoss * (1 - probabilityOfProfit))
  
  return {
    riskRewardRatio,
    expectedValue,
    probabilityOfProfit: probabilityOfProfit * 100,
    maxLoss,
    maxProfit
  }
}

/**
 * Calculate safe leverage recommendation based on volatility
 */
export function calculateSafeLeverage(
  asset: string,
  volatility: number,
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive' = 'Moderate'
): number {
  // Base leverage based on volatility (higher volatility = lower leverage)
  const baseLeverage = Math.max(1, Math.min(50, 10 / volatility))
  
  // Adjust based on risk tolerance
  const riskMultiplier = {
    Conservative: 0.5,
    Moderate: 1.0,
    Aggressive: 1.5
  }[riskTolerance]
  
  const recommendedLeverage = Math.round(baseLeverage * riskMultiplier)
  
  return Math.max(1, Math.min(50, recommendedLeverage))
}

/**
 * Calculate position size based on risk management
 */
export function calculatePositionSize(
  accountValue: number,
  riskPercentage: number,
  stopLossPercentage: number
): number {
  const riskAmount = accountValue * (riskPercentage / 100)
  const positionSize = riskAmount / (stopLossPercentage / 100)
  return positionSize
}

/**
 * Calculate margin requirement
 */
export function calculateMarginRequirement(
  positionSize: number,
  leverage: number
): number {
  return positionSize / leverage
}

/**
 * Calculate maximum position size based on available liquidity
 */
export function calculateMaxPositionSize(
  availableLiquidity: number,
  maxLeverage: number,
  price: number
): number {
  return Math.min(availableLiquidity, price * maxLeverage)
}

/**
 * Validate position parameters
 */
export function validatePosition(params: PositionParams): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const { asset, collateral, leverage, entryPrice } = params
  
  if (!asset) {
    errors.push('Asset is required')
  }
  
  if (collateral <= 0) {
    errors.push('Collateral must be greater than 0')
  }
  
  if (leverage < 1 || leverage > 50) {
    errors.push('Leverage must be between 1x and 50x')
  }
  
  if (entryPrice <= 0) {
    errors.push('Entry price must be greater than 0')
  }
  
  const assetConfig = SUPPORTED_ASSETS.find(a => a.symbol === asset)
  if (assetConfig && leverage > assetConfig.maxLeverage) {
    errors.push(`Maximum leverage for ${asset} is ${assetConfig.maxLeverage}x`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
