'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { calculateTotalFees, validatePosition } from '@/lib/gmx-calculations'
import { UI_CONSTANTS } from '@/lib/constants'
import { CalculatorState, FeeCalculation } from '@/types'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { DollarSign, Clock, TrendingUp, AlertTriangle, Info } from 'lucide-react'

interface FundingFeesEstimatorProps {
  state: CalculatorState
  onStateChange: (newState: Partial<CalculatorState>) => void
}

export function FundingFeesEstimator({ state, onStateChange }: FundingFeesEstimatorProps) {
  const [calculation, setCalculation] = useState<FeeCalculation | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  // Calculate fees whenever state changes
  useEffect(() => {
    try {
      const validation = validatePosition({
        asset: state.asset,
        collateral: state.collateral,
        leverage: state.leverage,
        isLong: state.isLong,
        entryPrice: state.entryPrice,
      })

      if (validation.isValid) {
        const timeframes = UI_CONSTANTS.timeframes.map(tf => {
          const feeResult = calculateTotalFees({
            asset: state.asset,
            collateral: state.collateral,
            leverage: state.leverage,
            isLong: state.isLong,
            entryPrice: state.entryPrice,
          }, tf.value)

          return {
            label: tf.label,
            hours: tf.value,
            positionFee: feeResult.positionFee,
            borrowingFee: feeResult.borrowingFee,
            fundingFee: feeResult.fundingFee,
            totalFees: feeResult.totalFees,
          }
        })

        const totalFees24h = calculateTotalFees({
          asset: state.asset,
          collateral: state.collateral,
          leverage: state.leverage,
          isLong: state.isLong,
          entryPrice: state.entryPrice,
        }, 24).totalFees

        setCalculation({
          timeframes,
          totalFees24h,
        })
        setErrors([])
      } else {
        setErrors(validation.errors)
        setCalculation(null)
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Calculation error'])
      setCalculation(null)
    }
  }, [state])

  const positionSize = state.collateral * state.leverage

  return (
    <div className="space-y-6">
      {/* Position Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Position Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Position Size</p>
              <p className="text-lg font-semibold">{formatCurrency(positionSize)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Collateral</p>
              <p className="text-lg font-semibold">{formatCurrency(state.collateral)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Leverage</p>
              <p className="text-lg font-semibold">{state.leverage}x</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Daily Fees</p>
              <p className="text-lg font-semibold text-yellow-400">
                {calculation ? formatCurrency(calculation.totalFees24h) : '$0.00'}
              </p>
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

      {/* Fee Breakdown */}
      {calculation && (
        <>
          {/* Fee Types Explanation */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Fee Types Explained
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-300">Position Fee</h4>
                  <p className="text-sm text-gray-400">
                    One-time fee charged when opening a position (0.01% of position size)
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(calculation.timeframes[0].positionFee)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-300">Borrowing Fee</h4>
                  <p className="text-sm text-gray-400">
                    Hourly fee for borrowing liquidity (0.01% per hour of position size)
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(calculation.timeframes[0].borrowingFee)}/hour
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-300">Funding Fee</h4>
                  <p className="text-sm text-gray-400">
                    Hourly fee that varies based on market conditions and funding rates
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {formatCurrency(calculation.timeframes[0].fundingFee)}/hour
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeframe Analysis */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Fee Analysis by Timeframe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {calculation.timeframes.map((timeframe) => (
                  <div key={timeframe.hours} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-300">{timeframe.label}</h4>
                      <Badge variant="gmx" className="text-sm">
                        Total: {formatCurrency(timeframe.totalFees)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Position Fee</p>
                        <p className="font-medium">{formatCurrency(timeframe.positionFee)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Borrowing Fee</p>
                        <p className="font-medium text-yellow-400">{formatCurrency(timeframe.borrowingFee)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Funding Fee</p>
                        <p className="font-medium text-blue-400">{formatCurrency(timeframe.fundingFee)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-400">Total Fees</p>
                        <p className="font-medium text-lg text-red-400">{formatCurrency(timeframe.totalFees)}</p>
                      </div>
                    </div>

                    {/* Fee Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Fee Breakdown</span>
                        <span>{formatCurrency(timeframe.totalFees)}</span>
                      </div>
                      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-yellow-500"
                          style={{ width: `${(timeframe.borrowingFee / timeframe.totalFees) * 100}%` }}
                        />
                        <div 
                          className="absolute h-full bg-blue-500"
                          style={{ 
                            width: `${(timeframe.fundingFee / timeframe.totalFees) * 100}%`,
                            left: `${(timeframe.borrowingFee / timeframe.totalFees) * 100}%`
                          }}
                        />
                        <div 
                          className="absolute h-full bg-gray-500"
                          style={{ 
                            width: `${(timeframe.positionFee / timeframe.totalFees) * 100}%`,
                            left: `${((timeframe.borrowingFee + timeframe.fundingFee) / timeframe.totalFees) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Borrowing</span>
                        <span>Funding</span>
                        <span>Position</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cost Impact Analysis */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cost Impact Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-300 mb-2">Daily Cost</h4>
                  <p className="text-2xl font-bold text-yellow-400">
                    {formatCurrency(calculation.totalFees24h)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatNumber((calculation.totalFees24h / state.collateral) * 100)}% of collateral
                  </p>
                </div>
                
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-300 mb-2">Weekly Cost</h4>
                  <p className="text-2xl font-bold text-orange-400">
                    {formatCurrency(calculation.totalFees24h * 7)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatNumber((calculation.totalFees24h * 7 / state.collateral) * 100)}% of collateral
                  </p>
                </div>
                
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-300 mb-2">Monthly Cost</h4>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(calculation.totalFees24h * 30)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatNumber((calculation.totalFees24h * 30 / state.collateral) * 100)}% of collateral
                  </p>
                </div>
              </div>

              {/* Warning for High Fees */}
              {calculation.totalFees24h > state.collateral * 0.01 && (
                <Alert variant="warning" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>High Fee Warning:</strong> Daily fees exceed 1% of your collateral. 
                    Consider reducing leverage or position size to minimize costs.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
