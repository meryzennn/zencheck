export default function HowItWorksPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
          How <span className="text-primary">ZenCheck</span> Works
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          ZenCheck combines real-time on-chain data with advanced heuristics to
          protect you from rugpulls and malicious contracts on Solana.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Step 1: Data Aggregation */}
        <div className="glass-panel p-8 flex flex-col items-start text-left">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-6 ring-2 ring-primary/10">
            <span className="material-symbols-outlined text-2xl">api</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            1. Multi-Node Data Aggregation
          </h3>
          <p className="text-sm text-text-muted leading-relaxed mb-4">
            ZenCheck doesn&apos;t rely on a single source of truth. We
            simultaneously query <strong>Alchemy RPC nodes</strong> for raw
            Solana blockchain state (Token Supply, Largest Accounts) and{" "}
            <strong>DexScreener API</strong> for off-chain market metrics
            (Liquidity, FDV, Price).
          </p>
          <ul className="text-xs text-text-secondary space-y-2 font-mono">
            <li>• Connection: wss://solana-mainnet.g.alchemy.com</li>
            <li>• Fallback: https://api.mainnet-beta.solana.com</li>
          </ul>
        </div>

        {/* Step 2: Live Socket Monitoring */}
        <div className="glass-panel p-8 flex flex-col items-start text-left">
          <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary mb-6 ring-2 ring-secondary/10">
            <span className="material-symbols-outlined text-2xl">sensors</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">
            2. Real-Time WSS Tracking
          </h3>
          <p className="text-sm text-text-muted leading-relaxed mb-4">
            We establish a persistent WebSocket (WSS) connection using{" "}
            <code className="text-secondary bg-secondary/10 px-1 rounded">
              @solana/web3.js
            </code>
            . By binding an{" "}
            <code className="text-secondary bg-secondary/10 px-1 rounded">
              onAccountChange
            </code>{" "}
            listener directly to the token&apos;s contract address, ZenCheck
            updates instantly if a developer maliciously revokes or alters
            contract authorities mid-trade.
          </p>
        </div>
      </div>

      {/* Deep Dive into the Algorithm */}
      <h2 className="text-3xl font-black text-white mb-4 text-center mt-20">
        The 0-100 Risk Algorithm
      </h2>
      <p className="text-center text-text-muted max-w-2xl mx-auto mb-4">
        Every token starts with a perfect score of <strong>100</strong>. Our
        algorithm ONLY checks for <strong>rug-pull indicators</strong> — it does{" "}
        <strong>NOT</strong> penalize for price drops, low market cap, or low
        volume. A token that crashes 90% in price but has all authorities
        revoked and LP burned will still score &quot;Good&quot;.
      </p>

      {/* What we DON'T check */}
      <div className="glass-panel p-5 border-l-4 border-l-secondary max-w-4xl mx-auto mb-12">
        <h4 className="text-sm font-bold text-secondary mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">info</span>
          What ZenCheck Does NOT Penalize
        </h4>
        <div className="flex flex-wrap gap-3">
          <span className="text-xs bg-surface-dark px-3 py-1 rounded-full border border-border-dark text-text-secondary">
            ❌ Price Drops
          </span>
          <span className="text-xs bg-surface-dark px-3 py-1 rounded-full border border-border-dark text-text-secondary">
            ❌ Low Market Cap
          </span>
          <span className="text-xs bg-surface-dark px-3 py-1 rounded-full border border-border-dark text-text-secondary">
            ❌ Low Volume
          </span>
          <span className="text-xs bg-surface-dark px-3 py-1 rounded-full border border-border-dark text-text-secondary">
            ❌ Negative Price Change
          </span>
        </div>
        <p className="text-xs text-text-muted mt-2">
          These are market factors, NOT rug-pull indicators. A small-cap token
          with revoked authorities is safer than a large-cap token with active
          mint authority.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Blue Chip */}
        <div className="glass-panel p-6 border-l-4 border-l-secondary flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">
                verified
              </span>
              Blue-Chip Safeguard
            </h4>
            <p className="text-sm text-text-muted">
              Massive established tokens (like JUP or WIF) often utilize dynamic
              LP systems (like Meteora DLMMs) that basic scanners flag as
              &quot;Unlocked&quot;. If a token has{" "}
              <strong>&gt;$50M Market Cap</strong> and{" "}
              <strong>&gt;$2M Liquidity</strong>, ZenCheck skips minor heuristic
              deductions and locks the score at Verified Safe (100).
            </p>
          </div>
        </div>

        {/* Contract Authority */}
        <div className="glass-panel p-6 border-l-4 border-l-danger/80">
          <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-danger">
              admin_panel_settings
            </span>
            Smart Contract Authorities
          </h4>
          <p className="text-xs text-text-muted mb-3">
            These are the most critical indicators. Active authorities mean the
            developer retains control over the token contract.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  Mint Authority Active
                </span>
                <span className="text-danger font-bold">-25 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Creator can print unlimited tokens, inflating supply and
                crashing your value to zero.
              </p>
            </div>
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  Freeze Authority Active
                </span>
                <span className="text-danger font-bold">-20 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Creator can freeze your wallet, making it impossible for you to
                sell or transfer tokens.
              </p>
            </div>
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  Update Authority Active
                </span>
                <span className="text-warning font-bold">-10 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Creator can update the contract metadata or behavior after
                deployment.
              </p>
            </div>
          </div>
        </div>

        {/* Liquidity */}
        <div className="glass-panel p-6 border-l-4 border-l-danger/80">
          <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-danger">
              water_drop
            </span>
            Liquidity Pool (LP) Health
          </h4>
          <p className="text-xs text-text-muted mb-3">
            LP status is the second most critical rug-pull indicator. If the
            developer can withdraw liquidity, they can &quot;pull the rug&quot;
            at any moment.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">LP Unlocked</span>
                <span className="text-danger font-bold">-25 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Dev can withdraw all liquidity at any time. This is the classic
                rug-pull vector. Highest risk.
              </p>
            </div>
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  LP Locked (Not Burned)
                </span>
                <span className="text-warning font-bold">-5 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Safer — dev can&apos;t withdraw until lock expires. Check the
                lock duration on Solscan.
              </p>
            </div>
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">LP Burned ✓</span>
                <span className="text-secondary font-bold">0 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Safest state — liquidity is permanently locked. No one can ever
                withdraw it.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  Liquidity &lt; $500
                </span>
                <span className="text-danger font-bold">-10 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Not enough liquidity to sell. Even small trades cause massive
                slippage.
              </p>
            </div>
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  Liq/MCap Ratio &lt; 0.5%
                </span>
                <span className="text-warning font-bold">-5 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Liquidity is thin relative to market cap — structural
                vulnerability.
              </p>
            </div>
          </div>
        </div>

        {/* Holders */}
        <div className="glass-panel p-6 border-l-4 border-l-warning">
          <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-warning">
              groups
            </span>
            Top Holder Concentration
          </h4>
          <p className="text-xs text-text-muted mb-3">
            High concentration means a single wallet or small group can crash
            the market with one sell order. We check up to 20 holders.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  Top Wallet &gt; 50%
                </span>
                <span className="text-danger font-bold">-15 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Critical: One wallet controls the majority of supply.
              </p>
            </div>
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  Top Wallet &gt; 30%
                </span>
                <span className="text-warning font-bold">-10 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                High risk: Large insider position.
              </p>
            </div>
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  Top Wallet &gt; 15%
                </span>
                <span className="text-warning font-bold">-5 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Moderate risk: Significant individual holding.
              </p>
            </div>
            <div className="bg-surface-dark p-3 rounded border border-border-dark">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">
                  Top 5 Wallets &gt; 80%
                </span>
                <span className="text-danger font-bold">-10 pts</span>
              </div>
              <p className="text-xs text-text-muted">
                Combined concentration is extremely high.
              </p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="glass-panel p-6 border-l-4 border-l-primary">
          <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              calculate
            </span>
            Score Breakdown
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
              <span className="text-2xl font-black text-secondary">80-100</span>
              <p className="text-xs text-text-muted mt-1 font-bold uppercase">
                Good
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Low risk. Authorities revoked, LP secured.
              </p>
            </div>
            <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
              <span className="text-2xl font-black text-warning">50-79</span>
              <p className="text-xs text-text-muted mt-1 font-bold uppercase">
                Warning
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Some red flags. DYOR before buying.
              </p>
            </div>
            <div className="bg-danger/10 p-4 rounded-lg border border-danger/20">
              <span className="text-2xl font-black text-danger">0-49</span>
              <p className="text-xs text-text-muted mt-1 font-bold uppercase">
                Danger
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Critical rug-pull indicators. Avoid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
