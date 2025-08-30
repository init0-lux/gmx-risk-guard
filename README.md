# GMX Risk Guard 🛡️

A comprehensive risk management dapp for GMX perpetual traders on Avalanche, featuring advanced liquidation calculations, PnL simulations, and leverage recommendations.

![GMX Risk Guard](https://img.shields.io/badge/GMX-Risk%20Guard-blue?style=for-the-badge&logo=ethereum)
![Avalanche](https://img.shields.io/badge/Avalanche-C--Chain-orange?style=for-the-badge&logo=avalanche)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## 🚀 Features

### Core Risk Management Tools

- **🔒 Liquidation Price Calculator**
  - Real-time liquidation price calculation based on GMX V2 logic
  - Visual price distance indicators
  - Risk level assessment (Conservative/Moderate/Aggressive)
  - Margin ratio analysis

- **📊 PnL Simulator**
  - Interactive price movement scenarios (±5%, ±10%, ±20%, ±50%)
  - Color-coded profit/loss visualization
  - Breakeven price calculations
  - ROI analysis

- **💰 Funding & Borrowing Fees Estimator**
  - Time-based fee calculations (1 hour, 1 day, 7 days, 30 days)
  - Detailed fee breakdown (position, borrowing, funding)
  - Cost impact analysis
  - High fee warnings

- **🎯 Safe Leverage Recommendation**
  - Volatility-based leverage suggestions
  - Risk tolerance customization
  - Historical volatility analysis
  - Dynamic leverage adjustments

- **⚖️ Risk/Reward Ratio Calculator**
  - Custom stop-loss and take-profit levels
  - Expected value calculations
  - Win probability analysis
  - Trade setup recommendations

### Advanced Features

- **🔗 Wallet Integration**
  - Rainbow Kit wallet connection
  - Avalanche network support
  - Real-time balance display
  - Position tracking

- **📱 Responsive Design**
  - Mobile-first approach
  - Glass morphism UI
  - Dark theme optimization
  - Smooth animations

- **⚡ Performance Optimized**
  - React Query for data fetching
  - Debounced calculations
  - Optimized re-renders
  - Fast load times

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library

### Blockchain
- **Ethers.js v6** - Ethereum interaction
- **Wagmi** - React hooks for Ethereum
- **Rainbow Kit** - Wallet connection UI

### Data & State
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### UI/UX
- **Lucide React** - Icon library
- **Framer Motion** - Animations
- **Recharts** - Data visualization

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/gmx-risk-guard.git
   cd gmx-risk-guard
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your configuration:
   ```env
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
   NEXT_PUBLIC_GMX_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/gmx-io/gmx-avalanche
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### WalletConnect Setup

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID
4. Add it to your `.env.local` file

### GMX Integration

The app is configured for GMX V2 on Avalanche by default. Key contract addresses:

```typescript
GMX_CONTRACTS = {
  router: '0x5F719c2F1095F7B9fc68a68e35B51194f4abEe20',
  vault: '0x489ee077994B6658eAfA855C308275EAd8097C4A',
  positionRouter: '0xb87a436B93fFE9D75c5cFA7bAcFff96430b09868',
  orderBook: '0x09f77E8A13De9a35a7231028187e9fD5db8a2ACB',
}
```

## 📁 Project Structure

```
gmx-risk-guard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Main dashboard page
│   │   ├── globals.css        # Global styles
│   │   └── providers.tsx      # App providers (Wagmi, React Query)
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── Dashboard.tsx      # Main dashboard component
│   │   ├── LiquidationCalculator.tsx
│   │   ├── PnLSimulator.tsx
│   │   ├── FundingFeesEstimator.tsx
│   │   ├── SafeLeverageRecommendation.tsx
│   │   ├── RiskRewardRatio.tsx
│   │   └── WalletConnect.tsx
│   ├── lib/
│   │   ├── utils.ts           # Utility functions
│   │   ├── gmx-calculations.ts # GMX calculation logic
│   │   ├── constants.ts       # App constants
│   │   └── wagmi-config.ts    # Wagmi configuration
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── api/
│       └── gmx-data.ts        # GMX API integration
├── public/                    # Static assets
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
└── README.md
```

## 🧮 Calculation Logic

### Liquidation Price Formula

```typescript
// GMX V2 liquidation threshold (85% of margin)
const liquidationThreshold = 0.85
const marginRatio = 1 / leverage

// For long positions
liquidationPrice = entryPrice * (1 - marginRatio * liquidationThreshold)

// For short positions  
liquidationPrice = entryPrice * (1 + marginRatio * liquidationThreshold)
```

### PnL Calculation

```typescript
const positionSize = collateral * leverage
const priceChangePercentage = (currentPrice - entryPrice) / entryPrice * 100

// For long positions
pnl = positionSize * (priceChangePercentage / 100)
pnlPercentage = priceChangePercentage * leverage

// For short positions
pnl = positionSize * (-priceChangePercentage / 100)
pnlPercentage = -priceChangePercentage * leverage
```

### Fee Structure

```typescript
const FEE_STRUCTURE = {
  swapFee: 0.0005,        // 0.05%
  positionFee: 0.0001,    // 0.01%
  liquidationFee: 0.02,   // 2%
  borrowingFee: 0.0001,   // 0.01% per hour
  fundingRate: 0.0001,    // 0.01% per hour (varies)
}
```

## 🎨 UI Components

The app uses a custom design system built on shadcn/ui with:

- **Glass Morphism** - Translucent cards with backdrop blur
- **Gradient Backgrounds** - Blue to purple gradients
- **Dark Theme** - Optimized for trading environments
- **Responsive Grid** - Mobile-first layout
- **Interactive Elements** - Hover states and animations

### Color Palette

```css
:root {
  --gmx-blue: #3B82F6;
  --gmx-purple: #8B5CF6;
  --profit-green: #10B981;
  --loss-red: #EF4444;
  --warning-yellow: #F59E0B;
}
```

## 🔒 Security Considerations

- **Client-side calculations** - All calculations run in the browser
- **No private key storage** - Wallet connection only
- **Read-only operations** - No transaction signing
- **Input validation** - Comprehensive error handling
- **Rate limiting** - API call throttling

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository**
   ```bash
   vercel --prod
   ```

2. **Set environment variables**
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - `NEXT_PUBLIC_GMX_SUBGRAPH_URL`

3. **Deploy**
   ```bash
   git push origin main
   ```

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify** - Static site generation
- **Railway** - Full-stack deployment
- **DigitalOcean** - App Platform
- **AWS** - Amplify or EC2

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- **TypeScript** - All code must be typed
- **ESLint** - Follow linting rules
- **Prettier** - Consistent code formatting
- **Testing** - Add tests for new features
- **Documentation** - Update docs for changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

**This tool is for educational purposes only. Always do your own research and never risk more than you can afford to lose.**

- Calculations are estimates and may not reflect actual GMX behavior
- Market conditions can change rapidly
- Past performance doesn't guarantee future results
- Always verify calculations independently
- Use proper risk management strategies

## 🙏 Acknowledgments

- **GMX Team** - For building an amazing perpetual trading platform
- **Avalanche Foundation** - For the high-performance blockchain
- **shadcn/ui** - For the excellent component library
- **Rainbow Kit** - For seamless wallet integration
- **Vercel** - For the amazing Next.js framework

## 📞 Support

- **Discord** - Join our community
- **GitHub Issues** - Report bugs or request features
- **Documentation** - Check the docs for detailed guides
- **Twitter** - Follow for updates

---

**Built with ❤️ for the GMX and Avalanche communities**
