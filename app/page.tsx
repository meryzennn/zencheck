"use client";

import { useState, useEffect } from "react";
import SearchInput from "@/components/SearchInput";
import GlassPanel from "@/components/GlassPanel";
import RiskBadge from "@/components/RiskBadge";
import Link from "next/link";

const features = [
  {
    icon: "verified_user",
    iconColor: "text-secondary",
    title: "Authority Checks",
    description:
      "Instantly verify mint authority and freeze authority status. Know if the dev can print more tokens or freeze your wallet.",
  },
  {
    icon: "water_drop",
    iconColor: "text-primary",
    title: "Liquidity Analysis",
    description:
      "Detailed breakdown of LP burn status and locked liquidity percentages. Don't fall for fake liquidity pools.",
  },
  {
    icon: "pie_chart",
    iconColor: "text-danger",
    title: "Holder Distribution",
    description:
      "Detect whale wallets and dangerous supply concentration. Visualize the top 10 holders and sniper bot activity.",
  },
];

const popularTokens = [
  { symbol: "$BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
  { symbol: "$WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
  {
    symbol: "$POPCAT",
    address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
  },
];

const gradients = [
  "from-orange-400 to-yellow-600",
  "from-green-500 to-emerald-600",
  "from-pink-500 to-purple-600",
  "from-blue-400 to-indigo-600",
  "from-cyan-400 to-blue-600",
  "from-red-400 to-pink-600",
  "from-violet-400 to-purple-600",
  "from-amber-400 to-orange-600",
];

interface TrendingToken {
  name: string;
  symbol: string;
  address: string;
  score: number;
  price: number;
  priceChange24h: number;
  searches: number;
  logoUrl: string | null;
}

function formatPrice(n: number): string {
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export default function Home() {
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    async function fetchTrending(isInitial = false) {
      try {
        if (isInitial) setLoadingTrending(true);
        const res = await fetch("/api/trending");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTrendingTokens(data);
        }
      } catch (err) {
        console.error("Failed to fetch trending:", err);
      } finally {
        if (isInitial) setLoadingTrending(false);
      }
    }
    fetchTrending(true);

    // Poll every 15 seconds for live data
    const intervalId = setInterval(() => fetchTrending(false), 15000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="w-full relative py-20 px-4 md:py-32 flex flex-col items-center justify-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none animate-float" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none animate-float-delayed" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-danger/5 rounded-full blur-3xl pointer-events-none animate-float" />

        <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center gap-6">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-dark border border-border-dark text-xs font-medium text-secondary mb-2 animate-slide-down">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            Live Solana Rug Checker Active
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] glow-text animate-slide-up">
            Stay Zen.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-white to-primary animate-gradient-x">
              Don&apos;t Get Rugged.
            </span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-2xl font-light animate-slide-up-delayed">
            Analyze any Solana token address instantly for liquidity locks, mint
            authority, and holder distribution risks before you ape in.
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-xl mt-8 animate-slide-up-delayed-2">
            <SearchInput />
            <div className="flex gap-4 mt-4 justify-center text-xs text-text-muted">
              <span>Popular:</span>
              {popularTokens.map((t) => (
                <Link
                  key={t.symbol}
                  href={`/token/${t.address}`}
                  className="cursor-pointer hover:text-secondary transition-colors hover:scale-110 transform duration-200"
                >
                  {t.symbol}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-4 mb-10">
          <h2 className="text-3xl font-bold text-white">Deep Dive Analytics</h2>
          <p className="text-text-secondary">
            Advanced rug-pull detection algorithms designed to keep your SOL
            safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <GlassPanel
              key={f.title}
              hover
              className={`p-8 flex flex-col gap-4 animate-stagger-in`}
              style={{ animationDelay: `${i * 150}ms` } as React.CSSProperties}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-surface-dark border border-border-dark flex items-center justify-center ${f.iconColor} group-hover:scale-110 transition-transform`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {f.icon}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {f.description}
                </p>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>

      {/* 🔥 Top Trending Tokens on Solana */}
      <section className="w-full max-w-7xl px-6 py-12 mb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🔥</span> Trending Solana Tokens
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Live trending tokens on Solana — check for rugs before you ape in
            </p>
          </div>
          <Link
            href="/trending"
            className="text-primary text-sm font-medium hover:text-white transition-colors flex items-center gap-1 group"
          >
            View All{" "}
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        {loadingTrending ? (
          <GlassPanel className="overflow-hidden border border-border-dark">
            <div className="p-8 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-surface-dark border-t-primary rounded-full animate-spin" />
              <p className="text-text-muted text-sm">
                Fetching live trending tokens...
              </p>
            </div>
          </GlassPanel>
        ) : trendingTokens.length > 0 ? (
          <GlassPanel className="overflow-hidden border border-border-dark">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-dark/50 border-b border-border-dark text-text-secondary text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-medium">#</th>
                    <th className="px-6 py-4 font-medium">Token</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium hidden sm:table-cell">
                      24h Change
                    </th>
                    <th className="px-6 py-4 font-medium hidden sm:table-cell">
                      Scans
                    </th>
                    <th className="px-6 py-4 font-medium text-right">
                      Risk Score
                    </th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-dark text-sm">
                  {trendingTokens.slice(0, 5).map((token, i) => (
                    <tr
                      key={token.address}
                      className="hover:bg-white/5 transition-colors group animate-stagger-in"
                      style={
                        {
                          animationDelay: `${i * 100}ms`,
                        } as React.CSSProperties
                      }
                    >
                      <td className="px-6 py-4 text-text-muted font-medium">
                        {i + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {token.logoUrl ? (
                            <img
                              src={token.logoUrl}
                              alt={token.symbol}
                              className="w-8 h-8 rounded-full object-cover bg-surface-dark shrink-0"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const fallback =
                                  target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-xs shadow-lg`}
                            style={{ display: token.logoUrl ? "none" : "flex" }}
                          >
                            {(token.symbol || "?")[0].replace("$", "")}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {token.symbol}
                            </span>
                            <span className="text-text-muted text-xs block">
                              {token.name}
                            </span>
                            <span className="text-text-muted text-[10px] font-mono opacity-60">
                              {token.address.slice(0, 4)}...
                              {token.address.slice(-4)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        {formatPrice(token.price)}
                      </td>
                      <td
                        className={`px-6 py-4 hidden sm:table-cell font-medium ${
                          token.priceChange24h >= 0
                            ? "text-secondary"
                            : "text-danger"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            {token.priceChange24h >= 0
                              ? "trending_up"
                              : "trending_down"}
                          </span>
                          {token.priceChange24h >= 0 ? "+" : ""}
                          {token.priceChange24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary hidden sm:table-cell">
                        {formatNumber(token.searches)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <RiskBadge score={token.score} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/token/${token.address}`}
                          title={`Rug check ${token.symbol}`}
                        >
                          <button className="px-4 py-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger font-semibold text-xs transition-all border border-danger/20 hover:border-danger/40 cursor-pointer hover:scale-105 transform duration-200">
                            Rug Check
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        ) : (
          <GlassPanel className="p-8 text-center border border-border-dark">
            <span className="material-symbols-outlined text-5xl text-text-muted mb-3 block">
              token
            </span>
            <p className="text-white font-bold text-lg">
              No Trending Tokens Yet
            </p>
            <p className="text-text-muted text-sm mt-1">
              Paste any Solana token address above to rug check it!
            </p>
          </GlassPanel>
        )}

        {/* Interactive CTA */}
        <div className="mt-12 text-center">
          <Link href="/trending">
            <button className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-105 transform cursor-pointer overflow-hidden">
              <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              <span className="material-symbols-outlined text-2xl relative z-10">
                explore
              </span>
              <span className="relative z-10">Explore All Trending Tokens</span>
              <span className="material-symbols-outlined text-xl relative z-10 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}
