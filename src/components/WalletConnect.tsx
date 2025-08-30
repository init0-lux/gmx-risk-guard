'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { shortenAddress } from '@/lib/utils'
import { Wallet, Copy } from 'lucide-react'
import { useState } from 'react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isConnected && address) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-gmx-blue to-gmx-purple">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Connected Wallet</p>
                <p className="font-medium">{shortenAddress(address)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">Connected</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              {copied && (
                <span className="text-xs text-green-400">Copied!</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex justify-center">
      <ConnectButton />
    </div>
  )
}
