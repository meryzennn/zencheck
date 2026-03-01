"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GlassPanel from "@/components/GlassPanel";
import RiskBadge, { getRiskLevel } from "@/components/RiskBadge";

interface TrendingToken {
  name: string;
  symbol: string;
  address: string;
  gradient: string;
  letter: string;
  riskScore: number;
  price: number;
  priceNative: string;
  priceChange24h: number;
  marketCap: string;
  scans: number;
}

// We will now fetch this dynamically
// const trendingTokens: TrendingToken[] = [...];

const timeFrames = ["24H", "1H", "6H", "7D"];
const riskFilters = ["All", "Safe", "Warning", "Danger"];

function SparklineChart({ positive }: { positive: boolean }) {
  const color = positive ? "#4ade80" : "#ef4444";
  // Generate a simple sparkline path
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

export default function TrendingPage() {
  const [activeTimeFrame, setActiveTimeFrame] = useState("24H");
  const [activeRiskFilter, setActiveRiskFilter] = useState("All");
  const [trendingTokens, setTrendingTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        const res = await fetch("/api/trending");
        const data = await res.json();

        // Map backend trending data to frontend TrendingToken format.
        const formatted: TrendingToken[] = data.map((t: any, i: number) => ({
          name: t.name || "Unknown Token",
          symbol: t.symbol || "$UNK",
          address: t.address,
          gradient:
            i % 2 === 0
              ? "from-blue-400 to-indigo-600"
              : "from-purple-400 to-violet-600",
          letter: (t.symbol || "U")[0].replace("$", ""),
          riskScore: t.score || 50,
          price: t.price || 0,
          priceNative: t.priceNative || "0",
          priceChange24h: t.priceChange24h || 0,
          marketCap: t.marketCap || "$1.2M", // In a real app, this would come from the API
          scans: t.searches,
        }));
        setTrendingTokens(formatted);
      } catch (error) {
        console.error("Failed to fetch trending tokens:", error);
      } finally {
        if (isInitial) setLoading(false);
      }
    }
    fetchTrending(true);

    // Set up polling for real-time updates every 5 seconds
    const intervalId = setInterval(() => {
      fetchTrending(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredTokens = trendingTokens.filter((token) => {
    if (activeRiskFilter === "All") return true;
    const { label } = getRiskLevel(token.riskScore);
    return label === activeRiskFilter;
  });

  if (loading) {
    return (
      <div className="w-full max-w-7xl px-4 md:px-6 py-32 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-surface-dark border-t-primary rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-white">
          Loading Trending Tokens...
        </h2>
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
          Most scanned tokens in the last 24 hours
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex gap-2">
          {timeFrames.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeFrame(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTimeFrame === tf
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-surface-dark text-text-secondary border border-border-dark hover:text-white hover:border-primary/50"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
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
      </div>

      {/* Token Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {filteredTokens.slice(0, 6).map((token) => (
          <GlassPanel key={token.address} hover className="p-6 flex flex-col">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${token.gradient} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {token.letter}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{token.name}</h3>
                  <span className="text-text-muted text-xs">
                    Market Cap: {token.marketCap}
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
                    $
                    {token.price < 0.01
                      ? token.price.toFixed(6)
                      : token.price.toFixed(2)}
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
                    {token.priceChange24h}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted uppercase tracking-wider">
                  Scans
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
              <button className="w-full py-3 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-secondary font-semibold text-sm transition-all border border-secondary/20 hover:border-secondary/40 cursor-pointer">
                Analyze Token
              </button>
            </Link>
          </GlassPanel>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Token Leaderboard
        </h2>
        <GlassPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-dark/50 border-b border-border-dark text-text-secondary text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">Token</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">
                    24h Change
                  </th>
                  <th className="px-6 py-4 font-medium hidden lg:table-cell">
                    Market Cap
                  </th>
                  <th className="px-6 py-4 font-medium">Risk Score</th>
                  <th className="px-6 py-4 font-medium text-right">Scans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark text-sm">
                {filteredTokens.map((token, i) => (
                  <tr
                    key={token.address}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-text-muted font-medium">
                      #{i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/token/${token.address}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${token.gradient} flex items-center justify-center text-white font-bold text-xs`}
                        >
                          {token.letter}
                        </div>
                        <span className="font-bold text-white">
                          {token.symbol}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">
                          $
                          {token.price < 0.01
                            ? token.price.toFixed(6)
                            : token.price.toFixed(2)}
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
                      {token.priceChange24h >= 0 ? "+" : ""}
                      {token.priceChange24h}%
                    </td>
                    <td className="px-6 py-4 text-text-secondary hidden lg:table-cell">
                      {token.marketCap}
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge score={token.riskScore} showScore={false} />
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium">
                      {token.scans.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
