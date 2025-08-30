'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WalletConnect } from './WalletConnect'
import { LiquidationCalculator } from './LiquidationCalculator'
import { PnLSimulator } from './PnLSimulator'
import { FundingFeesEstimator } from './FundingFeesEstimator'
import { SafeLeverageRecommendation } from './SafeLeverageRecommendation'
import { RiskRewardRatio } from './RiskRewardRatio'
import { CalculatorState } from '@/types'
import { SUPPORTED_ASSETS } from '@/lib/constants'
import { TrendingUp, Shield, Calculator, DollarSign, Target, BarChart3 } from 'lucide-react'

export function Dashboard() {
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    asset: 'AVAX',
    collateral: 1000,
    leverage: 5,
    isLong: true,
    entryPrice: 25.50,
    currentPrice: 25.50,
  })

  const handleStateChange = (newState: Partial<CalculatorState>) => {
    setCalculatorState(prev => ({ ...prev, ...newState }))
  }

  const selectedAsset = SUPPORTED_ASSETS.find(asset => asset.symbol === calculatorState.asset)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-gmx-blue to-gmx-purple">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gmx-blue to-gmx-purple bg-clip-text text-transparent">
            GMX Risk Guard
          </h1>
        </div>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Advanced risk management tools for GMX perpetual traders on Avalanche. 
          Calculate liquidation prices, simulate PnL scenarios, and get safe leverage recommendations.
        </p>
        
        {/* Wallet Connection */}
        <div className="mt-6">
          <WalletConnect />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Selected Asset</p>
                <p className="text-lg font-semibold">{selectedAsset?.name}</p>
              </div>
              <Badge variant="gmx">{selectedAsset?.symbol}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Entry Price</p>
                <p className="text-lg font-semibold">${calculatorState.entryPrice.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Leverage</p>
                <p className="text-lg font-semibold">{calculatorState.leverage}x</p>
              </div>
              <Target className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Position Size</p>
                <p className="text-lg font-semibold">${(calculatorState.collateral * calculatorState.leverage).toLocaleString()}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Calculator Interface */}
      <Tabs defaultValue="liquidation" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="liquidation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Liquidation
          </TabsTrigger>
          <TabsTrigger value="pnl" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            PnL Simulator
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="leverage" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Leverage
          </TabsTrigger>
          <TabsTrigger value="risk-reward" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Risk/Reward
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liquidation" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Liquidation Price Calculator
              </CardTitle>
              <CardDescription>
                Calculate the exact price at which your position will be liquidated and understand your margin requirements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiquidationCalculator 
                state={calculatorState}
                onStateChange={handleStateChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pnl" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                PnL Simulator
              </CardTitle>
              <CardDescription>
                Simulate profit and loss scenarios under different price movements and market conditions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PnLSimulator 
                state={calculatorState}
                onStateChange={handleStateChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Funding & Borrowing Fees Estimator
              </CardTitle>
              <CardDescription>
                Calculate the total cost of holding your position including funding rates and borrowing fees.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FundingFeesEstimator 
                state={calculatorState}
                onStateChange={handleStateChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leverage" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Safe Leverage Recommendation
              </CardTitle>
              <CardDescription>
                Get personalized leverage recommendations based on asset volatility and your risk tolerance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SafeLeverageRecommendation 
                state={calculatorState}
                onStateChange={handleStateChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-reward" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Risk/Reward Ratio Calculator
              </CardTitle>
              <CardDescription>
                Analyze the risk-reward ratio of your position with custom stop-loss and take-profit levels.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RiskRewardRatio 
                state={calculatorState}
                onStateChange={handleStateChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-400">
        <p className="text-sm">
          GMX Risk Guard - Advanced risk management for perpetual traders
        </p>
        <p className="text-xs mt-2">
          This tool is for educational purposes. Always do your own research and never risk more than you can afford to lose.
        </p>
      </footer>
    </div>
  )
}
