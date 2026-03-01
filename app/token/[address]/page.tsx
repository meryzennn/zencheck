"use client";

import { use, useState, useEffect } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import type { TokenAnalysis } from "@/services/types";
import GlassPanel from "@/components/GlassPanel";
import RiskGauge from "@/components/RiskGauge";
import { StatusBadge, LpStatusBadge } from "@/components/StatusBadge";
import { getRiskLevel } from "@/components/RiskBadge";

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatPrice(n: number): string {
  if (n < 0.001) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

export default function TokenPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const [token, setToken] = useState<TokenAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchToken(isInitial = false) {
      try {
        if (isInitial) setLoading(true);
        const res = await fetch(`/api/tokens/${address}`);
        if (!res.ok) throw new Error("Token not found");
        const data = await res.json();
        setToken(data);
      } catch (err) {
        console.error(err);
        if (isInitial) setError(true);
      } finally {
        if (isInitial) setLoading(false);
      }
    }
    fetchToken(true);

    // Set up polling for real-time updates every 10 seconds
    const intervalId = setInterval(() => {
      fetchToken(false);
    }, 10000);

    // Set up Helius WebSocket for instant on-chain contract changes (Mint/Freeze authority)
    let subscriptionId: number | null = null;
    let connection: Connection | null = null;

    try {
      const apiKey = process.env.NEXT_PUBLIC_HELIUS_API_KEY;
      const wssUrl = apiKey
        ? `wss://mainnet.helius-rpc.com/?api-key=${apiKey}`
        : "wss://api.mainnet-beta.solana.com";

      connection = new Connection(wssUrl, "confirmed");
      const pubkey = new PublicKey(address);

      subscriptionId = connection.onAccountChange(pubkey, (accountInfo) => {
        console.log(
          "⚡ WebSocket detected on-chain contract change!",
          accountInfo,
        );
        fetchToken(false); // Instantly refresh UI, bypassing 10s poll
      });
    } catch (err) {
      console.warn("WebSocket subscription failed:", err);
    }

    return () => {
      clearInterval(intervalId);
      if (connection && subscriptionId !== null) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [address]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl px-4 md:px-6 py-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Header Skeleton */}
            <div className="glass-panel p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-surface-dark" />
                <div className="flex-1 space-y-3 w-full">
                  <div className="h-6 bg-surface-dark rounded w-1/3" />
                  <div className="h-4 bg-surface-dark rounded w-1/4" />
                </div>
                <div className="w-24 h-24 rounded-full bg-surface-dark" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 h-48 bg-surface-dark/50" />
              <div className="glass-panel p-6 h-48 bg-surface-dark/50" />
            </div>

            <div className="glass-panel p-6 h-96 bg-surface-dark/50" />
          </div>

          <div className="flex flex-col gap-6">
            <div className="glass-panel p-6 h-64 bg-surface-dark/50" />
            <div className="glass-panel p-6 h-96 bg-surface-dark/50" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !token) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <span className="material-symbols-outlined text-6xl text-text-muted">
          search_off
        </span>
        <h2 className="text-2xl font-bold text-white">Token Not Found</h2>
        <p className="text-text-secondary">
          Double-check the address and try again.
        </p>
      </div>
    );
  }

  const { label: riskLabel } = getRiskLevel(token.riskScore);

  const copyAddress = () => {
    navigator.clipboard.writeText(token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content (2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Token Header + Risk Gauge */}
          <GlassPanel className="p-0 overflow-hidden flex flex-col relative">
            {/* Optional Banner Image */}
            {token.bannerUrl && (
              <div className="w-full h-32 md:h-48 relative overflow-hidden group">
                <img
                  src={token.bannerUrl}
                  alt={`${token.name} banner`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent"></div>
              </div>
            )}

            <div
              className={`p-6 md:p-8 ${token.bannerUrl ? "-mt-16 md:-mt-24 relative z-10" : ""}`}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                {/* Left Side: Logo & Text */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-2">
                    {/* Logo */}
                    {token.logoUrl ? (
                      <img
                        src={token.logoUrl}
                        alt={`${token.name} logo`}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover ring-4 ring-background shadow-xl bg-surface-dark shrink-0"
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
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-black text-2xl ring-4 ring-background shadow-xl shrink-0"
                      style={{ display: token.logoUrl ? "none" : "flex" }}
                    >
                      {token.symbol?.[0] || "?"}
                    </div>

                    {/* Token Text & Copy */}
                    <div className="mb-1 mt-3 sm:mt-0">
                      <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md flex items-center gap-2 flex-wrap">
                        {token.name}{" "}
                        <span className="text-text-secondary text-lg font-medium bg-surface-dark/50 px-2 rounded">
                          {token.symbol}
                        </span>
                      </h1>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-text-muted font-mono text-xs bg-surface-dark/80 px-2 py-1 rounded border border-white/5 truncate max-w-[200px] sm:max-w-none">
                          {token.address}
                        </span>
                        <button
                          onClick={copyAddress}
                          className="text-text-muted hover:text-white transition-colors cursor-pointer p-1 shrink-0"
                          title="Copy address"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {copied ? "check" : "content_copy"}
                          </span>
                        </button>
                        {copied && (
                          <span className="text-xs text-primary font-medium animate-fade-in shrink-0">
                            Copied!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Risk Gauge Header (Restored Size) */}
                <div className="flex flex-col items-center bg-surface-dark/80 p-5 rounded-2xl border border-white/10 backdrop-blur-xl mt-2 md:mt-0 shadow-2xl">
                  <RiskGauge score={token.riskScore} size={130} />
                  <span className="text-xs text-text-secondary uppercase tracking-wide font-bold mt-3">
                    Risk Assessment
                  </span>
                  <p className="text-xs text-text-muted text-center leading-relaxed mt-1 max-w-[160px]">
                    {riskLabel === "Safe"
                      ? "Low risk profile. High security."
                      : riskLabel === "Warning"
                        ? "Moderate risk. Checks needed."
                        : "High risk. Red flags detected."}
                  </p>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Authority + Liquidity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Authority Status */}
            <GlassPanel className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-lg">
                  verified_user
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Authority Status
                </h3>
              </div>
              <div className="divide-y divide-border-dark">
                <StatusBadge
                  status={token.mintAuthority}
                  label="Mint Authority"
                />
                <StatusBadge
                  status={token.freezeAuthority}
                  label="Freeze Authority"
                />
                <StatusBadge
                  status={token.updateAuthority}
                  label="Update Authority"
                />
              </div>
            </GlassPanel>

            {/* Liquidity Section */}
            <GlassPanel className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-lg">
                  water_drop
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Liquidity Section
                </h3>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">LP Status</span>
                  <LpStatusBadge status={token.lpStatus} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Primary DEX
                  </span>
                  <span className="text-sm text-white font-medium">
                    {token.dex}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Liquidity (USD)
                  </span>
                  <span className="text-sm text-white font-medium">
                    ${formatNumber(token.liquidityUsd)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">
                    Liq/MCap Ratio
                  </span>
                  <span className="text-sm text-white font-medium">
                    {token.liqMcapRatio}%
                  </span>
                </div>
              </div>
            </GlassPanel>
          </div>

          {/* Top Holders */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">
                pie_chart
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Holders Concentration
              </h3>
            </div>
            {token.topHolders && token.topHolders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-text-secondary text-xs uppercase tracking-wider border-b border-border-dark">
                      <th className="py-3 pr-4 font-medium">Rank</th>
                      <th className="py-3 pr-4 font-medium">Address</th>
                      <th className="py-3 pr-4 font-medium hidden sm:table-cell">
                        Quantity
                      </th>
                      <th className="py-3 pr-4 font-medium">Percentage</th>
                      <th className="py-3 font-medium text-right">Tag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark text-sm">
                    {token.topHolders.map((holder) => (
                      <tr
                        key={holder.rank}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 pr-4 text-text-muted font-medium">
                          #{holder.rank}
                        </td>
                        <td className="py-3 pr-4 text-white font-mono text-xs">
                          {holder.address}
                        </td>
                        <td className="py-3 pr-4 text-text-secondary hidden sm:table-cell">
                          {formatNumber(holder.quantity)}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm">
                              {holder.percentage}%
                            </span>
                            <div className="flex-1 h-1.5 bg-border-dark rounded-full max-w-[80px]">
                              <div
                                className={`h-full rounded-full ${
                                  holder.percentage > 10
                                    ? "bg-danger"
                                    : "bg-primary"
                                }`}
                                style={{
                                  width: `${Math.min(holder.percentage * 2, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          {holder.tag ? (
                            <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full border border-danger/20">
                              {holder.tag}
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted">
                              Regular
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-surface-dark/50 rounded-lg border border-border-dark border-dashed">
                <span className="material-symbols-outlined text-4xl mb-3 text-text-muted">
                  account_balance_wallet
                </span>
                <p className="text-white font-medium">Data Unavailable</p>
                <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto">
                  Unable to fetch top holders safely. Check network or RPC keys.
                </p>
              </div>
            )}
          </GlassPanel>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          {/* Market Data */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">
                candlestick_chart
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Market Data
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs text-text-muted">Current Price</span>
                <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(token.price)}
                  </span>
                  <span className="text-sm text-text-muted font-medium bg-surface-dark border border-border-dark px-2 py-0.5 rounded-full">
                    {token.priceNative} SOL
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      token.priceChange24h >= 0
                        ? "text-secondary"
                        : "text-danger"
                    }`}
                  >
                    {token.priceChange24h >= 0 ? "+" : ""}
                    {token.priceChange24h.toFixed(2)}%{" "}
                    <span className="text-xs">24h</span>
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-text-muted">Market Cap</span>
                  <p className="text-sm font-medium text-white mt-1">
                    ${formatNumber(token.marketCap)}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-text-muted">24h Volume</span>
                  <p className="text-sm font-medium text-white mt-1">
                    ${formatNumber(token.volume24h)}
                  </p>
                </div>
              </div>
              <div className="border-t border-border-dark pt-4 flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Total Supply</span>
                  <span className="text-white font-medium">
                    {formatNumber(token.totalSupply)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Circulating Supply</span>
                  <span className="text-white font-medium">
                    {formatNumber(token.circulatingSupply)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Token Decimals</span>
                  <span className="text-white font-medium">
                    {token.decimals}
                  </span>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Quick Actions */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">
                bolt
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Quick Actions
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`https://raydium.io/swap/?inputMint=sol&outputMint=${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/50 transition-colors"
              >
                <span className="text-sm text-white font-medium">
                  Swap on Raydium
                </span>
                <span className="material-symbols-outlined text-text-muted text-lg">
                  open_in_new
                </span>
              </a>
              <a
                href={`https://solscan.io/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/50 transition-colors"
              >
                <span className="text-sm text-white font-medium">
                  View on Solscan
                </span>
                <span className="material-symbols-outlined text-text-muted text-lg">
                  open_in_new
                </span>
              </a>
              <button className="flex items-center justify-between p-3 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/50 transition-colors cursor-pointer w-full">
                <span className="text-sm text-white font-medium">
                  Download Report
                </span>
                <span className="material-symbols-outlined text-text-muted text-lg">
                  download
                </span>
              </button>
            </div>
          </GlassPanel>

          {/* Real-Time Activity */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">
                electric_bolt
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Real-Time Activity
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              {token.recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-surface-dark border border-border-dark"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === "buy"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-danger/10 text-danger"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {activity.type === "buy"
                        ? "arrow_upward"
                        : "arrow_downward"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {activity.description}
                    </p>
                    <span className="text-xs text-text-muted">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
