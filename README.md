# 🧘 ZenRugCheck

**Stay Zen. Don't Get Rugged.**

ZenRugCheck is a powerful, real-time Solana token analysis tool designed to keep your SOL safe. Instantly analyze any Solana token address for liquidity locks, mint authority, and holder distribution risks before you ape in.

Developed by **[0x5zen (also known as meryzennn)](https://github.com/meryzennn)**.

---

## 🚀 Features

- **🛡️ Authority Checks**: Instantly verify mint authority and freeze authority status. Know if the developer can print more tokens or freeze your wallet.
- **💧 Liquidity Analysis**: Detailed breakdown of LP burn status and locked liquidity percentages. Don't fall for fake liquidity pools.
- **📊 Holder Distribution**: Detect whale wallets and token concentration. We automatically tag holders based on their portfolio value:
  - 🐋 **Whale**: $10k+
  - 🦐 **Shrimp**: $250+
  - 🐟 **Fish**: $10+
  - 🦠 **Plankton**: <$10
- **💼 Portfolio Tracking**: Connect your Solana wallet (Backpack, Phantom, etc.) to analyze your token holdings and review your recent transaction history.
- **🔥 Trending Tokens**: Live tracking of the top trending tokens on Solana, right on the dashboard.

## 🛠️ Tech Stack

This project is built using modern web technologies:

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Web3 Integration**:
  - `@solana/web3.js`
  - `@solana/wallet-adapter-react` & Wallet UI
  - Backpack Wallet Support
- **Other**: `html2canvas-pro` (for sharing graphical reports)

## 💻 Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/meryzennn/zencheck.git
   cd zencheck
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app in action.

## 📁 Project Structure

- **/app**: Next.js App Router configuration and pages (Home, Token, Trending, Portfolio, API routes).
- **/components**: Reusable React UI components (GlassPanel, RiskBadge, WalletProvider, SearchInput, etc.).
- **/services**: Core logic for Solana RPC interactions, token analysis, and database services.
- **/public**: Static assets like favicons and images.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/meryzennn/zencheck/issues).

## 📜 License

This project is open-source and available under the terms of the MIT License.

---

<p align="center">Made with ❤️ by <b>0x5zen</b></p>
