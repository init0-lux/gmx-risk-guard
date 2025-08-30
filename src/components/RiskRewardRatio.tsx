'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { calculateRiskReward, validatePosition } from '@/lib/gmx-calculations'
import { CalculatorState, RiskRewardCalculation } from '@/types'
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils'
import { Target, TrendingUp, TrendingDown, Calculator, AlertTriangle, Info } from 'lucide-react'

interface RiskRewardRatioProps {
  state: CalculatorState
  onStateChange: (newState: Partial<CalculatorState>) => void
}

export function RiskRewardRatio({ state, onStateChange }: RiskRewardRatioProps) {
  const [calculation, setCalculation] = useState<RiskRewardCalculation | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [stopLoss, setStopLoss] = useState<number>(state.entryPrice * 0.95) // 5% below entry
  const [takeProfit, setTakeProfit] = useState<number>(state.entryPrice * 1.10) // 10% above entry

  // Calculate risk/reward whenever inputs change
  useEffect(() => {
    try {
      const validation = validatePosition({
        asset: state.asset,
        collateral: state.collateral,
        leverage: state.leverage,
        isLong: state.isLong,
        entryPrice: state.entryPrice,
      })

      if (validation.isValid && stopLoss > 0 && takeProfit > 0) {
        const result = calculateRiskReward({
          asset: state.asset,
          collateral: state.collateral,
          leverage: state.leverage,
          isLong: state.isLong,
          entryPrice: state.entryPrice,
        }, stopLoss, takeProfit)

        // Generate recommendation based on risk/reward ratio
        let recommendation = ''
        if (result.riskRewardRatio >= 3) {
          recommendation = 'Excellent risk/reward ratio. This trade setup looks very favorable.'
        } else if (result.riskRewardRatio >= 2) {
          recommendation = 'Good risk/reward ratio. This trade setup is reasonable.'
        } else if (result.riskRewardRatio >= 1.5) {
          recommendation = 'Acceptable risk/reward ratio. Consider adjusting stop-loss or take-profit levels.'
        } else {
          recommendation = 'Poor risk/reward ratio. Consider revising your trade setup or avoiding this trade.'
        }

        setCalculation({
          ...result,
          recommendation,
        })
        setErrors([])
      } else {
        const newErrors = validation.errors
        if (stopLoss <= 0) newErrors.push('Stop-loss must be greater than 0')
        if (takeProfit <= 0) newErrors.push('Take-profit must be greater than 0')
        if (stopLoss >= takeProfit) newErrors.push('Stop-loss must be below take-profit for long positions')
        if (stopLoss <= takeProfit && !state.isLong) newErrors.push('Stop-loss must be above take-profit for short positions')
        
        setErrors(newErrors)
        setCalculation(null)
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Calculation error'])
      setCalculation(null)
    }
  }, [state, stopLoss, takeProfit])

  const positionSize = state.collateral * state.leverage

  // Auto-calculate stop-loss and take-profit based on common ratios
  const setCommonRatio = (ratio: number) => {
    if (state.isLong) {
      setStopLoss(state.entryPrice * (1 - 0.05)) // 5% below entry
      setTakeProfit(state.entryPrice * (1 + 0.05 * ratio)) // ratio * 5% above entry
    } else {
      setStopLoss(state.entryPrice * (1 + 0.05)) // 5% above entry
      setTakeProfit(state.entryPrice * (1 - 0.05 * ratio)) // ratio * 5% below entry
    }
  }

  return (
    <div className="space-y-6">
      {/* Position Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Position Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Entry Price</p>
              <p className="text-lg font-semibold">{formatCurrency(state.entryPrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Position Size</p>
              <p className="text-lg font-semibold">{formatCurrency(positionSize)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Direction</p>
              <Badge variant={state.isLong ? "profit" : "loss"}>
                {state.isLong ? "Long" : "Short"}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Leverage</p>
              <p className="text-lg font-semibold">{state.leverage}x</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stop-Loss and Take-Profit Inputs */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Set Stop-Loss & Take-Profit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Ratio Buttons */}
          <div className="space-y-3">
            <Label>Quick Setup (Risk:Reward)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                onClick={() => setCommonRatio(1)}
                className="text-xs"
              >
                1:1
              </Button>
              <Button
                variant="outline"
                onClick={() => setCommonRatio(2)}
                className="text-xs"
              >
                1:2
              </Button>
              <Button
                variant="outline"
                onClick={() => setCommonRatio(3)}
                className="text-xs"
              >
                1:3
              </Button>
              <Button
                variant="outline"
                onClick={() => setCommonRatio(5)}
                className="text-xs"
              >
                1:5
              </Button>
            </div>
          </div>

          {/* Manual Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop-Loss Price (USD)</Label>
              <Input
                id="stopLoss"
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                placeholder="24.00"
                min="0"
                step="0.01"
              />
              <div className="text-sm text-gray-400">
                {state.isLong ? 'Below entry price' : 'Above entry price'}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take-Profit Price (USD)</Label>
              <Input
                id="takeProfit"
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                placeholder="27.00"
                min="0"
                step="0.01"
              />
              <div className="text-sm text-gray-400">
                {state.isLong ? 'Above entry price' : 'Below entry price'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Risk/Reward Analysis */}
      {calculation && (
        <>
          {/* Main Results */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk/Reward Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Risk/Reward Ratio */}
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-300 mb-2">Risk/Reward Ratio</h4>
                  <div className={`text-3xl font-bold mb-2 ${
                    calculation.riskRewardRatio >= 2 ? 'text-green-400' : 
                    calculation.riskRewardRatio >= 1.5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    1:{formatNumber(calculation.riskRewardRatio, 2)}
                  </div>
                  <Badge 
                    variant={calculation.riskRewardRatio >= 2 ? 'success' : 
                            calculation.riskRewardRatio >= 1.5 ? 'warning' : 'destructive'}
                  >
                    {calculation.riskRewardRatio >= 2 ? 'Good' : 
                     calculation.riskRewardRatio >= 1.5 ? 'Acceptable' : 'Poor'}
                  </Badge>
                </div>

                {/* Expected Value */}
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-300 mb-2">Expected Value</h4>
                  <div className={`text-3xl font-bold mb-2 ${
                    calculation.expectedValue >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatCurrency(calculation.expectedValue)}
                  </div>
                  <p className="text-sm text-gray-400">
                    Per $1 risked
                  </p>
                </div>

                {/* Probability of Profit */}
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-300 mb-2">Win Probability</h4>
                  <div className={`text-3xl font-bold mb-2 ${
                    calculation.probabilityOfProfit >= 50 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {formatNumber(calculation.probabilityOfProfit, 1)}%
                  </div>
                  <p className="text-sm text-gray-400">
                    Based on ratio
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Detailed Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Risk Analysis */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-300">Risk Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stop-Loss Price:</span>
                      <span className="font-medium">{formatCurrency(stopLoss)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distance to Stop:</span>
                      <span className="font-medium text-red-400">
                        {formatCurrency(Math.abs(state.entryPrice - stopLoss))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stop-Loss %:</span>
                      <span className="font-medium text-red-400">
                        {formatPercentage(Math.abs((state.entryPrice - stopLoss) / state.entryPrice) * 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Loss:</span>
                      <span className="font-medium text-red-400">
                        {formatCurrency(calculation.maxLoss)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reward Analysis */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-300">Reward Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Take-Profit Price:</span>
                      <span className="font-medium">{formatCurrency(takeProfit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distance to Target:</span>
                      <span className="font-medium text-green-400">
                        {formatCurrency(Math.abs(takeProfit - state.entryPrice))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Take-Profit %:</span>
                      <span className="font-medium text-green-400">
                        {formatPercentage(Math.abs((takeProfit - state.entryPrice) / state.entryPrice) * 100)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Profit:</span>
                      <span className="font-medium text-green-400">
                        {formatCurrency(calculation.maxProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Risk/Reward Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Risk vs Reward Visualization</span>
                  <span className="font-medium">1:{formatNumber(calculation.riskRewardRatio, 2)}</span>
                </div>
                <div className="relative h-6 bg-gray-700 rounded-lg overflow-hidden">
                  <div 
                    className="absolute h-full bg-red-500"
                    style={{ width: '50%' }}
                  />
                  <div 
                    className="absolute h-full bg-green-500"
                    style={{ 
                      width: `${Math.min(50, (calculation.riskRewardRatio / 3) * 50)}%`,
                      left: '50%'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      Risk | Reward
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Risk: {formatCurrency(calculation.maxLoss)}</span>
                  <span>Reward: {formatCurrency(calculation.maxProfit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Trade Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-gray-700 rounded-lg">
                  <p className="text-gray-300">{calculation.recommendation}</p>
                </div>

                {/* Additional Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border border-gray-700 rounded-lg">
                    <h5 className="font-semibold text-gray-300 mb-2">Position Sizing</h5>
                    <p className="text-sm text-gray-400">
                      With {formatNumber(calculation.probabilityOfProfit, 1)}% win probability, 
                      consider risking no more than 1-2% of your account per trade.
                    </p>
                  </div>
                  
                  <div className="p-3 border border-gray-700 rounded-lg">
                    <h5 className="font-semibold text-gray-300 mb-2">Risk Management</h5>
                    <p className="text-sm text-gray-400">
                      Always use stop-losses and never risk more than you can afford to lose. 
                      Consider trailing stops for better risk management.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
