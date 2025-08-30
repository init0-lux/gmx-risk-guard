'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { calculateSafeLeverage, validatePosition } from '@/lib/gmx-calculations'
import { RISK_LEVELS } from '@/lib/constants'
import { CalculatorState, LeverageRecommendation } from '@/types'
import { formatNumber, getRiskLevel } from '@/lib/utils'
import { Target, TrendingUp, AlertTriangle, Shield, BarChart3, Info } from 'lucide-react'

interface SafeLeverageRecommendationProps {
  state: CalculatorState
  onStateChange: (newState: Partial<CalculatorState>) => void
}

// Mock volatility data (in real app, this would come from API)
const ASSET_VOLATILITY = {
  AVAX: 0.85, // 85% annualized volatility
  BTC: 0.65,  // 65% annualized volatility
  ETH: 0.75,  // 75% annualized volatility
  USDC: 0.05, // 5% annualized volatility
}

export function SafeLeverageRecommendation({ state, onStateChange }: SafeLeverageRecommendationProps) {
  const [recommendation, setRecommendation] = useState<LeverageRecommendation | null>(null)
  const [riskTolerance, setRiskTolerance] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate')
  const [errors, setErrors] = useState<string[]>([])

  // Calculate leverage recommendation whenever state or risk tolerance changes
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
        const volatility = ASSET_VOLATILITY[state.asset as keyof typeof ASSET_VOLATILITY] || 0.5
        const recommendedLeverage = calculateSafeLeverage(state.asset, volatility, riskTolerance)
        const maxSafeLeverage = calculateSafeLeverage(state.asset, volatility, 'Conservative')
        const currentRiskLevel = getRiskLevel(state.leverage)

        // Generate reasoning based on volatility and risk tolerance
        let reasoning = ''
        if (volatility > 0.8) {
          reasoning = 'High volatility asset - consider lower leverage for risk management'
        } else if (volatility > 0.5) {
          reasoning = 'Moderate volatility - balanced leverage recommended'
        } else {
          reasoning = 'Low volatility asset - higher leverage may be acceptable'
        }

        reasoning += ` (${formatNumber(volatility * 100)}% annualized volatility)`

        setRecommendation({
          recommendedLeverage,
          riskLevel: currentRiskLevel,
          volatility,
          maxSafeLeverage,
          reasoning,
        })
        setErrors([])
      } else {
        setErrors(validation.errors)
        setRecommendation(null)
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Calculation error'])
      setRecommendation(null)
    }
  }, [state, riskTolerance])

  const positionSize = state.collateral * state.leverage

  return (
    <div className="space-y-6">
      {/* Risk Tolerance Selection */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Tolerance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['Conservative', 'Moderate', 'Aggressive'] as const).map((level) => (
              <Button
                key={level}
                variant={riskTolerance === level ? "gmx" : "outline"}
                onClick={() => setRiskTolerance(level)}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <div className={`text-2xl ${RISK_LEVELS[level.toUpperCase() as keyof typeof RISK_LEVELS]?.color}`}>
                  {level === 'Conservative' ? '🛡️' : level === 'Moderate' ? '⚖️' : '🚀'}
                </div>
                <div className="text-center">
                  <div className="font-semibold">{level}</div>
                  <div className="text-xs opacity-80">
                    Max {RISK_LEVELS[level.toUpperCase() as keyof typeof RISK_LEVELS]?.maxLeverage}x
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Position Analysis */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Current Position Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Current Leverage</p>
              <p className="text-lg font-semibold">{state.leverage}x</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Position Size</p>
              <p className="text-lg font-semibold">${positionSize.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Asset Volatility</p>
              <p className="text-lg font-semibold text-yellow-400">
                {recommendation ? `${formatNumber(recommendation.volatility * 100)}%` : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Risk Level</p>
              <Badge 
                variant={recommendation?.riskLevel === 'Conservative' ? 'success' : 
                        recommendation?.riskLevel === 'Moderate' ? 'warning' : 'destructive'}
              >
                {recommendation?.riskLevel || 'N/A'}
              </Badge>
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

      {/* Leverage Recommendations */}
      {recommendation && (
        <>
          {/* Recommendation Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Leverage Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Recommendation */}
              <div className="text-center p-6 border border-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Recommended Leverage for {riskTolerance} Risk
                </h3>
                <div className="text-4xl font-bold text-gmx-blue mb-2">
                  {recommendation.recommendedLeverage}x
                </div>
                <p className="text-sm text-gray-400 mb-4">{recommendation.reasoning}</p>
                
                <Button 
                  variant="gmx" 
                  onClick={() => onStateChange({ leverage: recommendation.recommendedLeverage })}
                  className="w-full"
                >
                  Apply Recommended Leverage
                </Button>
              </div>

              {/* Leverage Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-300 mb-2">Conservative</h4>
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {calculateSafeLeverage(state.asset, recommendation.volatility, 'Conservative')}x
                  </div>
                  <p className="text-xs text-gray-400">Safest option</p>
                </div>
                
                <div className="text-center p-4 border border-gray-700 rounded-lg bg-gmx-blue/10">
                  <h4 className="font-semibold text-gray-300 mb-2">Moderate</h4>
                  <div className="text-2xl font-bold text-blue-400 mb-1">
                    {calculateSafeLeverage(state.asset, recommendation.volatility, 'Moderate')}x
                  </div>
                  <p className="text-xs text-gray-400">Balanced approach</p>
                </div>
                
                <div className="text-center p-4 border border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-300 mb-2">Aggressive</h4>
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    {calculateSafeLeverage(state.asset, recommendation.volatility, 'Aggressive')}x
                  </div>
                  <p className="text-xs text-gray-400">Higher risk/reward</p>
                </div>
              </div>

              {/* Leverage Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-300">Adjust Leverage</h4>
                  <Badge variant="gmx">{state.leverage}x</Badge>
                </div>
                <Slider
                  value={[state.leverage]}
                  onValueChange={([value]) => onStateChange({ leverage: value })}
                  min={1}
                  max={50}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>1x</span>
                  <span>25x</span>
                  <span>50x</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Analysis */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current vs Recommended */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2">Current Leverage</h4>
                    <div className="text-2xl font-bold mb-2">{state.leverage}x</div>
                    <Badge 
                      variant={recommendation.riskLevel === 'Conservative' ? 'success' : 
                              recommendation.riskLevel === 'Moderate' ? 'warning' : 'destructive'}
                    >
                      {recommendation.riskLevel}
                    </Badge>
                  </div>
                  
                  <div className="p-4 border border-gray-700 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2">Recommended Leverage</h4>
                    <div className="text-2xl font-bold text-gmx-blue mb-2">{recommendation.recommendedLeverage}x</div>
                    <Badge variant="gmx">{riskTolerance}</Badge>
                  </div>
                </div>

                {/* Risk Warnings */}
                {state.leverage > recommendation.recommendedLeverage * 1.5 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>High Risk Warning:</strong> Your current leverage ({state.leverage}x) is significantly 
                      higher than the recommended {recommendation.recommendedLeverage}x for {riskTolerance} risk tolerance. 
                      Consider reducing leverage to manage risk.
                    </AlertDescription>
                  </Alert>
                )}

                {state.leverage < recommendation.recommendedLeverage * 0.5 && (
                  <Alert variant="info">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Conservative Position:</strong> Your current leverage ({state.leverage}x) is lower than 
                      the recommended {recommendation.recommendedLeverage}x. This is safer but may limit potential returns.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Volatility Impact */}
                <div className="p-4 border border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-300 mb-2">Volatility Impact</h4>
                  <p className="text-sm text-gray-400 mb-3">
                    {state.asset} has {formatNumber(recommendation.volatility * 100)}% annualized volatility, 
                    which affects safe leverage levels.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Safe Leverage:</span>
                      <span className="font-medium text-green-400">{recommendation.maxSafeLeverage}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current vs Safe:</span>
                      <span className={`font-medium ${state.leverage <= recommendation.maxSafeLeverage ? 'text-green-400' : 'text-red-400'}`}>
                        {state.leverage <= recommendation.maxSafeLeverage ? 'Within Safe Range' : 'Above Safe Range'}
                      </span>
                    </div>
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
