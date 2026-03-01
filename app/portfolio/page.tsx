"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import Link from "next/link";
import GlassPanel from "@/components/GlassPanel";
import RiskBadge from "@/components/RiskBadge";
import PortfolioChart from "@/components/PortfolioChart";
import TransactionHistory from "@/components/TransactionHistory";

interface PortfolioToken {
  mint: string;
  name: string;
  symbol: string;
  logoUrl: string | null;
  balance: number;
  decimals: number;
  priceUsd: number;
  valueUsd: number;
  priceChange24h: number;
  riskScore: number | null;
}

interface WalletPortfolio {
  wallet: string;
  solBalance: number;
  solValueUsd: number;
  totalValueUsd: number;
  tokens: PortfolioToken[];
}

function formatPrice(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

const gradients = [
  "from-purple-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-blue-500 to-cyan-600",
  "from-green-500 to-emerald-600",
  "from-orange-500 to-amber-600",
  "from-violet-500 to-fuchsia-600",
  "from-teal-500 to-cyan-600",
  "from-red-500 to-pink-600",
];

export default function PortfolioPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "valued">("valued");

  useEffect(() => {
    if (!publicKey) {
      setPortfolio(null);
      return;
    }

    let cancelled = false;

    async function fetchPortfolio(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        const res = await fetch(
          `/api/portfolio?wallet=${publicKey!.toBase58()}`,
        );
        if (!res.ok) throw new Error("Failed to fetch portfolio");
        const data = await res.json();
        if (!cancelled) {
          setPortfolio(data);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled && isInitial) setError("Failed to load portfolio");
      } finally {
        if (!cancelled && isInitial) setLoading(false);
      }
    }

    fetchPortfolio(true);
    const interval = setInterval(() => fetchPortfolio(false), 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey]);

  // Disconnected state — beautiful CTA
  if (!connected || !publicKey) {
    return (
      <section className="w-full max-w-4xl px-6 py-20 flex flex-col items-center text-center">
        <div className="relative mb-8">
          {/* Animated glow orbs */}
          <div className="absolute -inset-8 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center shadow-2xl shadow-primary/20">
            <span className="material-symbols-outlined text-5xl text-primary animate-pulse">
              account_balance_wallet
            </span>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-white mb-4 animate-slide-up">
          Connect Your Wallet
        </h1>
        <p className="text-text-secondary text-lg max-w-md mb-8 animate-slide-up-delayed">
          Link your Solana wallet to view your token portfolio. Instantly
          rug-check every token you hold.
        </p>

        <button
          onClick={() => setVisible(true)}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 transform cursor-pointer overflow-hidden animate-slide-up-delayed-2"
        >
          <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          <span className="material-symbols-outlined text-2xl relative z-10">
            account_balance_wallet
          </span>
          <span className="relative z-10">Connect Wallet</span>
          <span className="material-symbols-outlined text-xl relative z-10 group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </button>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-2xl">
          {[
            {
              icon: "visibility",
              title: "View Holdings",
              desc: "See all your SPL tokens in one place",
            },
            {
              icon: "security",
              title: "Rug Check",
              desc: "One-click safety checks for every token",
            },
            {
              icon: "trending_up",
              title: "Track Value",
              desc: "Live USD values and price changes",
            },
          ].map((item, i) => (
            <GlassPanel
              key={item.title}
              className="p-5 text-center animate-stagger-in"
              style={{ animationDelay: `${i * 150}ms` } as React.CSSProperties}
            >
              <span className="material-symbols-outlined text-2xl text-primary mb-2 block">
                {item.icon}
              </span>
              <h3 className="text-sm font-bold text-white mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </GlassPanel>
          ))}
        </div>
      </section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <section className="w-full max-w-7xl px-6 py-8">
        {/* Header skeleton */}
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full skeleton" />
              <div>
                <div className="w-48 h-6 skeleton mb-2" />
                <div className="w-32 h-4 skeleton" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-32 h-16 skeleton rounded-lg" />
              <div className="w-32 h-16 skeleton rounded-lg" />
            </div>
          </div>
        </div>
        {/* Token grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="glass-panel rounded-xl p-5 animate-stagger-in"
              style={{ animationDelay: `${i * 100}ms` } as React.CSSProperties}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full skeleton" />
                <div>
                  <div className="w-24 h-4 skeleton mb-1" />
                  <div className="w-16 h-3 skeleton" />
                </div>
              </div>
              <div className="w-full h-4 skeleton mb-2" />
              <div className="w-2/3 h-4 skeleton" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="w-full max-w-4xl px-6 py-20 flex flex-col items-center text-center">
        <span className="material-symbols-outlined text-6xl text-danger mb-4">
          error_outline
        </span>
        <h2 className="text-2xl font-bold text-white mb-2">
          Failed to Load Portfolio
        </h2>
        <p className="text-text-secondary mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold transition-all hover:bg-primary/20 cursor-pointer"
        >
          Try Again
        </button>
      </section>
    );
  }

  if (!portfolio) return null;

  const shortAddr = `${portfolio.wallet.slice(0, 6)}...${portfolio.wallet.slice(-4)}`;

  const filteredTokens =
    filter === "valued"
      ? portfolio.tokens.filter((t) => t.valueUsd >= 0.01)
      : portfolio.tokens;

  return (
    <section className="w-full max-w-7xl px-6 py-8">
      {/* Portfolio Header */}
      <GlassPanel className="rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Wallet info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl">
                account_balance_wallet
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                My Portfolio
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-text-muted font-mono text-xs bg-surface-dark/80 px-2 py-0.5 rounded border border-border-dark">
                  {shortAddr}
                </span>
                <a
                  href={`https://solscan.io/account/${portfolio.wallet}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs hover:underline flex items-center gap-0.5"
                >
                  Solscan
                  <span className="material-symbols-outlined text-[10px]">
                    open_in_new
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Right: Value cards */}
          <div className="flex gap-3 flex-wrap">
            <div className="bg-surface-dark/80 rounded-xl p-4 border border-border-dark min-w-[130px]">
              <span className="text-xs text-text-muted block mb-1">
                Total Value
              </span>
              <span className="text-xl font-bold text-white">
                {formatUsd(portfolio.totalValueUsd)}
              </span>
            </div>
            <div className="bg-surface-dark/80 rounded-xl p-4 border border-border-dark min-w-[130px]">
              <span className="text-xs text-text-muted block mb-1">
                SOL Balance
              </span>
              <span className="text-xl font-bold text-white">
                {portfolio.solBalance.toFixed(4)}
              </span>
              <span className="text-xs text-text-muted ml-1">SOL</span>
            </div>
            <div className="bg-surface-dark/80 rounded-xl p-4 border border-border-dark min-w-[130px]">
              <span className="text-xs text-text-muted block mb-1">Tokens</span>
              <span className="text-xl font-bold text-white">
                {portfolio.tokens.length}
              </span>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Portfolio Charts */}
      {portfolio.tokens.filter((t) => t.valueUsd >= 0.01).length > 0 && (
        <PortfolioChart
          tokens={portfolio.tokens}
          solValueUsd={portfolio.solValueUsd}
          totalValueUsd={portfolio.totalValueUsd}
        />
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">token</span>
          Token Holdings
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("valued")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "valued"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-surface-dark text-text-muted border border-border-dark hover:text-white"
            }`}
          >
            With Value
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-surface-dark text-text-muted border border-border-dark hover:text-white"
            }`}
          >
            All Tokens ({portfolio.tokens.length})
          </button>
        </div>
      </div>

      {/* Token Grid */}
      {filteredTokens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTokens.map((token, i) => (
            <GlassPanel
              key={token.mint}
              hover
              className="rounded-xl p-5 flex flex-col gap-4 animate-stagger-in"
              style={{ animationDelay: `${i * 80}ms` } as React.CSSProperties}
            >
              {/* Token Header */}
              <div className="flex items-center gap-3">
                {token.logoUrl ? (
                  <img
                    src={token.logoUrl}
                    alt={token.symbol}
                    className="w-10 h-10 rounded-full object-cover bg-surface-dark shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                  style={{ display: token.logoUrl ? "none" : "flex" }}
                >
                  {(token.symbol || "?")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">
                    {token.name}
                  </h3>
                  <p className="text-text-muted text-xs">{token.symbol}</p>
                </div>
                {token.riskScore !== null && (
                  <RiskBadge score={token.riskScore} />
                )}
              </div>

              {/* Balance & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-text-muted text-xs block">Balance</span>
                  <span className="text-white font-medium text-sm">
                    {formatNumber(token.balance)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-text-muted text-xs block">Value</span>
                  <span className="text-white font-medium text-sm">
                    {token.valueUsd >= 0.01
                      ? formatUsd(token.valueUsd)
                      : token.valueUsd > 0
                        ? "<$0.01"
                        : "$0.00"}
                  </span>
                </div>
              </div>

              {/* Price row */}
              <div className="flex items-center justify-between text-xs border-t border-border-dark pt-3">
                <span className="text-text-muted">
                  {formatPrice(token.priceUsd)}
                </span>
                <span
                  className={`font-medium flex items-center gap-0.5 ${
                    token.priceChange24h >= 0 ? "text-secondary" : "text-danger"
                  }`}
                >
                  <span className="material-symbols-outlined text-xs">
                    {token.priceChange24h >= 0
                      ? "trending_up"
                      : "trending_down"}
                  </span>
                  {token.priceChange24h >= 0 ? "+" : ""}
                  {token.priceChange24h.toFixed(2)}%
                </span>
              </div>

              {/* Action */}
              <Link href={`/token/${token.mint}`}>
                <button className="w-full py-2.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger font-semibold text-xs transition-all border border-danger/20 hover:border-danger/40 cursor-pointer hover:scale-[1.02] transform duration-200 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    shield
                  </span>
                  Rug Check
                </button>
              </Link>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <GlassPanel className="p-12 text-center rounded-xl border border-border-dark">
          <span className="material-symbols-outlined text-5xl text-text-muted mb-4 block">
            inventory_2
          </span>
          <h3 className="text-xl font-bold text-white mb-2">
            {filter === "valued" ? "No Tokens With Value" : "No Tokens Found"}
          </h3>
          <p className="text-text-muted text-sm max-w-md mx-auto">
            {filter === "valued"
              ? "Your wallet has tokens but none with significant USD value. Switch to 'All Tokens' to see everything."
              : "This wallet doesn't hold any SPL tokens yet."}
          </p>
        </GlassPanel>
      )}

      {/* Separator */}
      <div className="my-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-dark to-transparent" />
        <span className="material-symbols-outlined text-text-muted text-sm">
          more_horiz
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border-dark to-transparent" />
      </div>

      {/* Transaction History */}
      <TransactionHistory walletAddress={portfolio.wallet} />
    </section>
  );
}
