'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { calculatePnL, validatePosition } from '@/lib/gmx-calculations'
import { UI_CONSTANTS } from '@/lib/constants'
import { CalculatorState, PnLCalculation } from '@/types'
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils'
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Percent, Target } from 'lucide-react'

interface PnLSimulatorProps {
  state: CalculatorState
  onStateChange: (newState: Partial<CalculatorState>) => void
}

export function PnLSimulator({ state, onStateChange }: PnLSimulatorProps) {
  const [calculation, setCalculation] = useState<PnLCalculation | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [selectedScenario, setSelectedScenario] = useState<number>(10)

  // Calculate PnL scenarios whenever state changes
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
        const scenarios = UI_CONSTANTS.priceChangeScenarios.map(change => {
          const priceChange = state.isLong ? change : -change
          const newPrice = state.entryPrice * (1 + priceChange / 100)
          const pnlResult = calculatePnL({
            asset: state.asset,
            collateral: state.collateral,
            leverage: state.leverage,
            isLong: state.isLong,
            entryPrice: state.entryPrice,
          }, newPrice)

          return {
            priceChange: change,
            price: newPrice,
            pnl: pnlResult.pnl,
            pnlPercentage: pnlResult.pnlPercentage,
            roi: pnlResult.roi,
          }
        })

        const breakevenResult = calculatePnL({
          asset: state.asset,
          collateral: state.collateral,
          leverage: state.leverage,
          isLong: state.isLong,
          entryPrice: state.entryPrice,
        }, state.entryPrice)

        setCalculation({
          scenarios,
          breakevenPrice: breakevenResult.breakevenPrice,
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
  const selectedScenarioData = calculation?.scenarios.find(s => s.priceChange === selectedScenario)

  return (
    <div className="space-y-6">
      {/* Position Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
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
              <p className="text-sm text-gray-400">Entry Price</p>
              <p className="text-lg font-semibold">{formatCurrency(state.entryPrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Leverage</p>
              <p className="text-lg font-semibold">{state.leverage}x</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Direction</p>
              <Badge variant={state.isLong ? "profit" : "loss"}>
                {state.isLong ? "Long" : "Short"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* PnL Scenarios */}
      {calculation && (
        <>
          {/* Scenario Buttons */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Price Movement Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {UI_CONSTANTS.priceChangeScenarios.map((change) => {
                  const scenario = calculation.scenarios.find(s => s.priceChange === change)
                  const isSelected = selectedScenario === change
                  
                  return (
                    <Button
                      key={change}
                      variant={isSelected ? (scenario?.pnl >= 0 ? "profit" : "loss") : "outline"}
                      onClick={() => setSelectedScenario(change)}
                      className="flex flex-col items-center gap-1 h-auto py-3"
                    >
                      <span className="text-sm font-medium">
                        {state.isLong ? '+' : '-'}{change}%
                      </span>
                      <span className="text-xs opacity-80">
                        {formatCurrency(scenario?.price || 0)}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Scenario Details */}
          {selectedScenarioData && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Scenario Analysis: {state.isLong ? '+' : '-'}{selectedScenario}% Price Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price Information */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-300">Price Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entry Price:</span>
                        <span className="font-medium">{formatCurrency(state.entryPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">New Price:</span>
                        <span className="font-medium">{formatCurrency(selectedScenarioData.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price Change:</span>
                        <span className={`font-medium ${selectedScenarioData.priceChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(selectedScenarioData.priceChange)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PnL Information */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-300">Profit & Loss</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">PnL:</span>
                        <span className={`font-medium text-lg ${selectedScenarioData.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(selectedScenarioData.pnl)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">PnL %:</span>
                        <span className={`font-medium ${selectedScenarioData.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(selectedScenarioData.pnlPercentage)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ROI:</span>
                        <span className={`font-medium ${selectedScenarioData.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(selectedScenarioData.roi)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Metrics */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-300">Risk Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Position Size:</span>
                        <span className="font-medium">{formatCurrency(positionSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Collateral:</span>
                        <span className="font-medium">{formatCurrency(state.collateral)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Breakeven:</span>
                        <span className="font-medium">{formatCurrency(calculation.breakevenPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual PnL Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">PnL Visualization</span>
                    <span className={`font-medium ${selectedScenarioData.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(selectedScenarioData.pnl)}
                    </span>
                  </div>
                  <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
                    <div 
                      className={`absolute h-full transition-all duration-500 ${
                        selectedScenarioData.pnl >= 0 
                          ? 'bg-gradient-to-r from-green-500 to-green-600' 
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.abs(selectedScenarioData.pnlPercentage) * 2)}%`,
                        left: selectedScenarioData.pnl >= 0 ? '50%' : 'auto',
                        right: selectedScenarioData.pnl < 0 ? '50%' : 'auto',
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {selectedScenarioData.pnl >= 0 ? 'Profit' : 'Loss'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Scenarios Table */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                All Scenarios Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-400">Price Change</th>
                      <th className="text-left py-2 text-gray-400">New Price</th>
                      <th className="text-left py-2 text-gray-400">PnL</th>
                      <th className="text-left py-2 text-gray-400">PnL %</th>
                      <th className="text-left py-2 text-gray-400">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculation.scenarios.map((scenario) => (
                      <tr key={scenario.priceChange} className="border-b border-gray-800">
                        <td className="py-2">
                          <Badge variant={scenario.priceChange > 0 ? "profit" : "loss"}>
                            {state.isLong ? '+' : '-'}{scenario.priceChange}%
                          </Badge>
                        </td>
                        <td className="py-2 font-medium">{formatCurrency(scenario.price)}</td>
                        <td className={`py-2 font-medium ${scenario.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(scenario.pnl)}
                        </td>
                        <td className={`py-2 font-medium ${scenario.pnlPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(scenario.pnlPercentage)}
                        </td>
                        <td className={`py-2 font-medium ${scenario.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercentage(scenario.roi)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
