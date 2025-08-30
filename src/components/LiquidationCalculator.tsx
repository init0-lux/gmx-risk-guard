'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { calculateLiquidationPrice, validatePosition } from '@/lib/gmx-calculations'
import { SUPPORTED_ASSETS, RISK_LEVELS } from '@/lib/constants'
import { CalculatorState, LiquidationCalculation } from '@/types'
import { formatNumber, formatCurrency, getRiskLevel, getRiskColor } from '@/lib/utils'
import { Shield, AlertTriangle, TrendingDown, TrendingUp, Info } from 'lucide-react'

interface LiquidationCalculatorProps {
  state: CalculatorState
  onStateChange: (newState: Partial<CalculatorState>) => void
}

export function LiquidationCalculator({ state, onStateChange }: LiquidationCalculatorProps) {
  const [calculation, setCalculation] = useState<LiquidationCalculation | null>(null)
  const [errors, setErrors] = useState<string[]>([])

  // Calculate liquidation price whenever state changes
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
        const result = calculateLiquidationPrice({
          asset: state.asset,
          collateral: state.collateral,
          leverage: state.leverage,
          isLong: state.isLong,
          entryPrice: state.entryPrice,
        })

        const riskLevel = getRiskLevel(state.leverage)
        
        setCalculation({
          liquidationPrice: result.liquidationPrice,
          distanceToLiquidation: result.distanceToLiquidation,
          distancePercentage: result.distancePercentage,
          marginRatio: result.marginRatio,
          riskLevel,
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

  const selectedAsset = SUPPORTED_ASSETS.find(asset => asset.symbol === state.asset)
  const positionSize = state.collateral * state.leverage

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asset Selection */}
        <div className="space-y-2">
          <Label htmlFor="asset">Asset</Label>
          <Select value={state.asset} onValueChange={(value) => onStateChange({ asset: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_ASSETS.map((asset) => (
                <SelectItem key={asset.symbol} value={asset.symbol}>
                  <div className="flex items-center gap-2">
                    <span>{asset.symbol}</span>
                    <span className="text-gray-400">- {asset.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Position Direction */}
        <div className="space-y-2">
          <Label>Position Direction</Label>
          <div className="flex gap-2">
            <Button
              variant={state.isLong ? "profit" : "outline"}
              onClick={() => onStateChange({ isLong: true })}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Long
            </Button>
            <Button
              variant={!state.isLong ? "loss" : "outline"}
              onClick={() => onStateChange({ isLong: false })}
              className="flex-1"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Short
            </Button>
          </div>
        </div>

        {/* Collateral Amount */}
        <div className="space-y-2">
          <Label htmlFor="collateral">Collateral Amount (USD)</Label>
          <Input
            id="collateral"
            type="number"
            value={state.collateral}
            onChange={(e) => onStateChange({ collateral: parseFloat(e.target.value) || 0 })}
            placeholder="1000"
            min="0"
            step="100"
          />
        </div>

        {/* Leverage */}
        <div className="space-y-2">
          <Label htmlFor="leverage">Leverage</Label>
          <div className="space-y-2">
            <Slider
              value={[state.leverage]}
              onValueChange={([value]) => onStateChange({ leverage: value })}
              min={selectedAsset?.minLeverage || 1}
              max={selectedAsset?.maxLeverage || 50}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>{selectedAsset?.minLeverage || 1}x</span>
              <span className="font-medium">{state.leverage}x</span>
              <span>{selectedAsset?.maxLeverage || 50}x</span>
            </div>
          </div>
        </div>

        {/* Entry Price */}
        <div className="space-y-2">
          <Label htmlFor="entryPrice">Entry Price (USD)</Label>
          <Input
            id="entryPrice"
            type="number"
            value={state.entryPrice}
            onChange={(e) => onStateChange({ entryPrice: parseFloat(e.target.value) || 0 })}
            placeholder="25.50"
            min="0"
            step="0.01"
          />
        </div>

        {/* Current Price */}
        <div className="space-y-2">
          <Label htmlFor="currentPrice">Current Price (USD)</Label>
          <Input
            id="currentPrice"
            type="number"
            value={state.currentPrice}
            onChange={(e) => onStateChange({ currentPrice: parseFloat(e.target.value) || 0 })}
            placeholder="25.50"
            min="0"
            step="0.01"
          />
        </div>
      </div>

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

      {/* Results Section */}
      {calculation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Liquidation Price Card */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5" />
                Liquidation Price
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {formatCurrency(calculation.liquidationPrice)}
                </div>
                <Badge variant="destructive" className="text-sm">
                  {state.isLong ? 'Price drops to' : 'Price rises to'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Distance to liquidation:</span>
                  <span className="font-medium">{formatCurrency(calculation.distanceToLiquidation)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Distance percentage:</span>
                  <span className="font-medium">{formatNumber(calculation.distancePercentage)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Margin ratio:</span>
                  <span className="font-medium">{formatNumber(calculation.marginRatio)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis Card */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge 
                  variant={calculation.riskLevel === 'Conservative' ? 'success' : 
                          calculation.riskLevel === 'Moderate' ? 'warning' : 'destructive'}
                  className="text-lg px-4 py-2"
                >
                  {calculation.riskLevel}
                </Badge>
                <p className="text-sm text-gray-400 mt-2">
                  {RISK_LEVELS[calculation.riskLevel.toUpperCase() as keyof typeof RISK_LEVELS]?.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Position size:</span>
                  <span className="font-medium">{formatCurrency(positionSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Required margin:</span>
                  <span className="font-medium">{formatCurrency(state.collateral)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max leverage:</span>
                  <span className="font-medium">{selectedAsset?.maxLeverage}x</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Price Distance Visual */}
      {calculation && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Price Distance Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-red-400">Liquidation: {formatCurrency(calculation.liquidationPrice)}</span>
                <span className="text-green-400">Current: {formatCurrency(state.currentPrice)}</span>
              </div>
              
              <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-red-500 to-yellow-500 to-green-500"
                  style={{
                    left: `${Math.max(0, Math.min(100, (calculation.distancePercentage / 50) * 100))}%`,
                    width: '2px',
                  }}
                />
                <div 
                  className="absolute top-0 h-full w-1 bg-white rounded-full"
                  style={{
                    left: `${Math.max(0, Math.min(100, (calculation.distancePercentage / 50) * 100))}%`,
                  }}
                />
              </div>
              
              <div className="text-center text-sm text-gray-400">
                {calculation.distancePercentage < 5 ? (
                  <span className="text-red-400 font-medium">⚠️ High liquidation risk!</span>
                ) : calculation.distancePercentage < 15 ? (
                  <span className="text-yellow-400 font-medium">⚠️ Moderate liquidation risk</span>
                ) : (
                  <span className="text-green-400 font-medium">✅ Safe distance from liquidation</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="w-full">
              <Info className="h-4 w-4 mr-2" />
              How Liquidation Works
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <div className="space-y-2">
              <p className="font-medium">GMX V2 Liquidation Mechanics:</p>
              <ul className="text-sm space-y-1">
                <li>• Positions are liquidated when margin ratio falls below ~85%</li>
                <li>• Higher leverage = lower liquidation price distance</li>
                <li>• Funding rates and fees affect liquidation price over time</li>
                <li>• Always maintain sufficient margin buffer</li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
