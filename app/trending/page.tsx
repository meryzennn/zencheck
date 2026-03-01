"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GlassPanel from "@/components/GlassPanel";
import RiskBadge, { getRiskLevel } from "@/components/RiskBadge";

interface TrendingToken {
  name: string;
  symbol: string;
  address: string;
  logoUrl: string | null;
  riskScore: number;
  price: number;
  priceNative: string;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  scans: number;
}

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

const riskFilters = ["All", "Safe", "Warning", "Danger"];

function formatPrice(n: number): string {
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toLocaleString()}`;
}

function SparklineChart({ positive }: { positive: boolean }) {
  const color = positive ? "#4ade80" : "#ef4444";
  const points = positive
    ? "M 0 30 Q 15 25, 30 20 T 60 15 T 90 10 T 120 5"
    : "M 0 5 Q 15 10, 30 18 T 60 22 T 90 28 T 120 30";

  return (
    <svg width="120" height="35" className="mt-2" viewBox="0 0 120 35">
      <defs>
        <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TokenIcon({
  token,
  size = 10,
  index = 0,
}: {
  token: TrendingToken;
  size?: number;
  index?: number;
}) {
  return (
    <>
      {token.logoUrl ? (
        <img
          src={token.logoUrl}
          alt={token.symbol}
          className="rounded-full object-cover bg-surface-dark shrink-0"
          style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white font-bold text-xs shadow-lg shrink-0`}
        style={{
          display: token.logoUrl ? "none" : "flex",
          width: `${size * 4}px`,
          height: `${size * 4}px`,
        }}
      >
        {(token.symbol || "?")[0].replace("$", "")}
      </div>
    </>
  );
}

export default function TrendingPage() {
  const [activeRiskFilter, setActiveRiskFilter] = useState("All");
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    async function fetchTrending(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        const res = await fetch("/api/trending");
        const data = await res.json();

        if (Array.isArray(data)) {
          const formatted: TrendingToken[] = data.map((t: any) => ({
            name: t.name || "Unknown Token",
            symbol: t.symbol || "$UNK",
            address: t.address,
            logoUrl: t.logoUrl || null,
            riskScore: t.score || 50,
            price: t.price || 0,
            priceNative: t.priceNative || "0",
            priceChange24h: t.priceChange24h || 0,
            marketCap: t.marketCap || 0,
            volume24h: t.volume24h || 0,
            scans: t.searches || 0,
          }));
          setTrendingTokens(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch trending tokens:", error);
      } finally {
        if (isInitial) setLoading(false);
      }
    }
    fetchTrending(true);

    const intervalId = setInterval(() => {
      fetchTrending(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredTokens = trendingTokens.filter((token) => {
    if (activeRiskFilter === "All") return true;
    const { label } = getRiskLevel(token.riskScore);
    return label === activeRiskFilter;
  });

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(10);
  }, [activeRiskFilter]);

  const visibleTokens = filteredTokens.slice(0, visibleCount);
  const hasMore = filteredTokens.length > visibleCount;

  if (loading) {
    return (
      <div className="w-full max-w-7xl px-4 md:px-6 py-32 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-surface-dark border-t-primary rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-white">
          Loading Trending Tokens...
        </h2>
        <p className="text-text-muted text-sm mt-2">
          Fetching live data from DexScreener
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 md:px-6 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🔥</span> Trending Tokens
        </h1>
        <p className="text-text-secondary mt-2">
          Top trending tokens on Solana right now — rug check before you buy
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <span className="text-xs text-text-muted uppercase tracking-wider font-bold">
          Filter by Risk:
        </span>
        <div className="flex gap-2">
          {riskFilters.map((rf) => (
            <button
              key={rf}
              onClick={() => setActiveRiskFilter(rf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeRiskFilter === rf
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-surface-dark text-text-secondary border border-border-dark hover:text-white hover:border-primary/50"
              }`}
            >
              {rf === "All" ? (
                rf
              ) : (
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      rf === "Safe"
                        ? "bg-secondary"
                        : rf === "Warning"
                          ? "bg-warning"
                          : "bg-danger"
                    }`}
                  />
                  {rf}
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-text-muted">
          Showing {visibleTokens.length} of {filteredTokens.length} tokens
        </span>
      </div>

      {/* Token Cards Grid — top 6 of visible */}
      {visibleTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {visibleTokens.slice(0, 6).map((token, i) => (
            <GlassPanel key={token.address} hover className="p-6 flex flex-col">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TokenIcon token={token} size={10} index={i} />
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      {token.name}
                    </h3>
                    <span className="text-text-muted text-xs">
                      MCap: {formatNumber(token.marketCap)}
                    </span>
                  </div>
                </div>
                <RiskBadge score={token.riskScore} showScore={false} />
              </div>

              {/* Price & Stats */}
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                    <span className="text-2xl font-bold text-white">
                      {formatPrice(token.price)}
                    </span>
                    <span className="text-xs text-text-muted font-medium bg-surface-dark border border-border-dark px-1.5 py-0.5 rounded-full">
                      {token.priceNative} SOL
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className={`material-symbols-outlined text-sm ${
                        token.priceChange24h >= 0
                          ? "text-secondary"
                          : "text-danger"
                      }`}
                    >
                      {token.priceChange24h >= 0
                        ? "trending_up"
                        : "trending_down"}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        token.priceChange24h >= 0
                          ? "text-secondary"
                          : "text-danger"
                      }`}
                    >
                      {token.priceChange24h >= 0 ? "+" : ""}
                      {token.priceChange24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-text-muted uppercase tracking-wider">
                    Boost
                  </span>
                  <p className="text-white font-bold">
                    {token.scans.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Sparkline */}
              <SparklineChart positive={token.priceChange24h >= 0} />

              {/* CTA */}
              <Link href={`/token/${token.address}`} className="mt-4">
                <button className="w-full py-3 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger font-semibold text-sm transition-all border border-danger/20 hover:border-danger/40 cursor-pointer">
                  Rug Check
                </button>
              </Link>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <GlassPanel className="p-8 text-center mb-8 border border-border-dark">
          <span className="material-symbols-outlined text-5xl text-text-muted mb-3 block">
            filter_list_off
          </span>
          <p className="text-white font-bold text-lg">
            No tokens match this filter
          </p>
          <p className="text-text-muted text-sm mt-1">
            Try selecting a different risk category.
          </p>
        </GlassPanel>
      )}

      {/* Leaderboard Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          Token Leaderboard
        </h2>
        <GlassPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dark/50 border-b border-border-dark text-text-secondary text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">#</th>
                  <th className="px-6 py-4 font-medium">Token</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">
                    24h
                  </th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">
                    Market Cap
                  </th>
                  <th className="px-6 py-4 font-medium">Risk</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark text-sm">
                {visibleTokens.map((token, i) => (
                  <tr
                    key={token.address}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-text-muted font-medium">
                      {i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <TokenIcon token={token} size={8} index={i} />
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
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          {formatPrice(token.price)}
                        </span>
                        <span className="text-xs text-text-muted">
                          {token.priceNative} SOL
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 hidden md:table-cell font-medium ${
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
                    <td className="px-6 py-4 text-text-secondary hidden lg:table-cell">
                      {formatNumber(token.marketCap)}
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge score={token.riskScore} showScore={false} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/token/${token.address}`}>
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
      </div>

      {/* Show More / Show Less */}
      {(hasMore || visibleCount > 10) && (
        <div className="flex justify-center gap-3 mb-12">
          {visibleCount > 10 && (
            <button
              onClick={() => setVisibleCount(10)}
              className="px-6 py-3 rounded-xl bg-surface-dark border border-border-dark hover:border-primary/50 text-text-secondary font-semibold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                expand_less
              </span>
              Show Less
            </button>
          )}
          {hasMore && (
            <button
              onClick={() => setVisibleCount((c) => c + 10)}
              className="px-8 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-semibold text-sm transition-all cursor-pointer flex items-center gap-2 hover:scale-105 transform duration-200"
            >
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
              Show More ({filteredTokens.length - visibleCount} remaining)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
