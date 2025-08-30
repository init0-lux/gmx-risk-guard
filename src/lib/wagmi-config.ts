import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { avalanche } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'GMX Risk Guard',
  projectId: process.env.REOWN_PROJECT_ID || "REOWN_PROJECT_ID",
  chains: [avalanche],
  ssr: true,
})
