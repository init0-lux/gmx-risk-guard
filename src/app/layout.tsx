import type { Metadata, Viewport } from 'next'
import "@rainbow-me/rainbowkit/styles.css";
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rizq - Avalanche Perpetual Trading Risk Calculator',
  description: 'Comprehensive risk management tools for GMX perpetual traders on Avalanche. Calculate liquidation prices, PnL scenarios, funding fees, and get safe leverage recommendations.',
  keywords: 'GMX, Avalanche, perpetual trading, risk management, liquidation calculator, leverage, DeFi, Rizq',
  authors: [{ name: 'GMX Risk Guard Team' }],
  openGraph: {
    title: 'GMX Risk Guard',
    description: 'Advanced risk management for GMX perpetual traders',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GMX Risk Guard',
    description: 'Advanced risk management for GMX perpetual traders',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
