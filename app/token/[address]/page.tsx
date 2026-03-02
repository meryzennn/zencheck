"use client";

import { use, useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas-pro";
import { Connection, PublicKey } from "@solana/web3.js";
import type { TokenAnalysis } from "@/services/types";
import GlassPanel from "@/components/GlassPanel";
import RiskGauge from "@/components/RiskGauge";
import ReportCard from "@/components/ReportCard";
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
  const [holdersVisible, setHoldersVisible] = useState(10);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

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

    // Set up Alchemy WebSocket for instant on-chain contract changes (Mint/Freeze authority)
    let subscriptionId: number | null = null;
    let connection: Connection | null = null;

    try {
      const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
      const wssUrl = apiKey
        ? `wss://solana-mainnet.g.alchemy.com/v2/${apiKey}`
        : "wss://api.mainnet-beta.solana.com";

      connection = new Connection(wssUrl, "confirmed");
      const pubkey = new PublicKey(address);

      subscriptionId = connection.onAccountChange(pubkey, (accountInfo) => {
        console.log(
          "⚡ WebSocket detected on-chain contract change!",
          accountInfo,
        );
        fetchToken(false);
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
            <div className="glass-panel p-6 h-48 bg-surface-dark/50" />
            <div className="glass-panel p-6 h-64 bg-surface-dark/50" />
            <div className="glass-panel p-6 h-96 bg-surface-dark/50" />
          </div>
          <div className="flex flex-col gap-6">
            <div className="glass-panel p-6 h-48 bg-surface-dark/50" />
            <div className="glass-panel p-6 h-64 bg-surface-dark/50" />
            <div className="glass-panel p-6 h-48 bg-surface-dark/50" />
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

  const fetchLogoAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const downloadReport = async () => {
    if (!token || !reportRef.current) return;
    try {
      // Pre-fetch logo as base64 to bypass CORS
      if (token.logoUrl && !logoBase64) {
        const b64 = await fetchLogoAsBase64(token.logoUrl);
        if (b64) {
          setLogoBase64(b64);
          // Wait for React to re-render with the base64 logo
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#020617",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `zenrugcheck-${token.symbol.toLowerCase()}-${token.address.slice(0, 8)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate report image:", err);
    }
  };

  return (
    <div className="w-full max-w-7xl px-4 md:px-6 py-8">
      {/* Hidden report card for PNG export */}
      {token && (
        <ReportCard ref={reportRef} token={token} logoBase64={logoBase64} />
      )}
      {/* Token Header + Banner + Risk Gauge */}
      <GlassPanel className="p-0 overflow-hidden flex flex-col relative mb-6">
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
                      const fallback = target.nextElementSibling as HTMLElement;
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

            {/* Right Side: Risk Gauge */}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========= LEFT COLUMN: RUG CHECK DATA (Primary) ========= */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Risk Analysis — THE MAIN EVENT (like rugcheck.xyz) */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="material-symbols-outlined text-primary text-lg">
                health_and_safety
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Risk Analysis
              </h3>
              <span className="text-text-muted text-xs ml-auto">
                {token.riskScore} / 100
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <RiskGauge score={token.riskScore} size={160} />
              <div className="flex-1 w-full">
                <div
                  className={`text-3xl font-black mb-2 ${
                    riskLabel === "Safe"
                      ? "text-secondary"
                      : riskLabel === "Warning"
                        ? "text-warning"
                        : "text-danger"
                  }`}
                >
                  {riskLabel === "Safe"
                    ? "Good"
                    : riskLabel === "Warning"
                      ? "Warning"
                      : "Danger"}
                </div>
                <p className="text-sm text-text-muted mb-4">
                  {riskLabel === "Safe"
                    ? "This token has a low risk profile. Authorities are revoked and liquidity appears healthy."
                    : riskLabel === "Warning"
                      ? "This token has moderate risk factors. Some authorities may still be active. DYOR."
                      : "This token has critical red flags. Active authorities and/or unlocked liquidity detected. Extreme caution."}
                </p>

                {/* Risk Factor Summary Pills */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                      token.mintAuthority === "revoked"
                        ? "text-secondary bg-secondary/10 border-secondary/20"
                        : "text-danger bg-danger/10 border-danger/20"
                    }`}
                  >
                    Mint:{" "}
                    {token.mintAuthority === "revoked"
                      ? "Disabled ✓"
                      : "Enabled ✗"}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                      token.freezeAuthority === "revoked"
                        ? "text-secondary bg-secondary/10 border-secondary/20"
                        : "text-danger bg-danger/10 border-danger/20"
                    }`}
                  >
                    Freeze:{" "}
                    {token.freezeAuthority === "revoked"
                      ? "Disabled ✓"
                      : "Enabled ✗"}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                      token.lpStatus === "burned"
                        ? "text-secondary bg-secondary/10 border-secondary/20"
                        : token.lpStatus === "locked"
                          ? "text-warning bg-warning/10 border-warning/20"
                          : "text-danger bg-danger/10 border-danger/20"
                    }`}
                  >
                    LP:{" "}
                    {token.lpStatus === "burned"
                      ? "Burned ✓"
                      : token.lpStatus === "locked"
                        ? "Locked ~"
                        : "Unlocked ✗"}
                  </span>
                </div>
              </div>
            </div>
          </GlassPanel>

          {/* Token Overview — Key rug-check data like rugcheck.xyz */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">
                token
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Token Overview
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border-dark">
              <div className="flex flex-col gap-3 pr-0 sm:pr-6 pb-4 sm:pb-0">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Supply</span>
                  <span className="text-white font-medium">
                    {formatNumber(token.totalSupply)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Circulating</span>
                  <span className="text-white font-medium">
                    {formatNumber(token.circulatingSupply)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Decimals</span>
                  <span className="text-white font-medium">
                    {token.decimals}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Market Cap</span>
                  <span className="text-white font-medium">
                    ${formatNumber(token.marketCap)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3 pl-0 sm:pl-6 pt-4 sm:pt-0">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Mint Authority</span>
                  <StatusBadge status={token.mintAuthority} label="" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Freeze Authority</span>
                  <StatusBadge status={token.freezeAuthority} label="" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Update Authority</span>
                  <StatusBadge status={token.updateAuthority} label="" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">LP Status</span>
                  <LpStatusBadge status={token.lpStatus} />
                </div>
                {token.mintAuthorityAddress && (
                  <div className="flex justify-between items-center text-sm border-t border-border-dark pt-3">
                    <span className="text-text-muted">Creator</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://solscan.io/account/${token.mintAuthorityAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-mono text-xs flex items-center gap-1"
                        title={token.mintAuthorityAddress}
                      >
                        {token.mintAuthorityAddress.slice(0, 4)}...
                        {token.mintAuthorityAddress.slice(-4)}
                        <span className="material-symbols-outlined text-[10px]">
                          open_in_new
                        </span>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            token.mintAuthorityAddress!,
                          );
                        }}
                        className="text-text-muted hover:text-primary transition-colors cursor-pointer p-0.5"
                        title="Copy address"
                      >
                        <span className="material-symbols-outlined text-sm">
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>
                )}
                {token.freezeAuthorityAddress && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Freeze Addr</span>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://solscan.io/account/${token.freezeAuthorityAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-danger hover:underline font-mono text-xs flex items-center gap-1"
                        title={token.freezeAuthorityAddress}
                      >
                        {token.freezeAuthorityAddress.slice(0, 4)}...
                        {token.freezeAuthorityAddress.slice(-4)}
                        <span className="material-symbols-outlined text-[10px]">
                          open_in_new
                        </span>
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            token.freezeAuthorityAddress!,
                          );
                        }}
                        className="text-text-muted hover:text-danger transition-colors cursor-pointer p-0.5"
                        title="Copy address"
                      >
                        <span className="material-symbols-outlined text-sm">
                          content_copy
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassPanel>

          {/* Liquidity & LP Lock Details */}
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-lg">
                water_drop
              </span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Liquidity & LP Lock
              </h3>
            </div>

            {/* LP Lock Status Banner */}
            <div
              className={`p-4 rounded-lg border mb-4 ${
                token.lpStatus === "burned"
                  ? "bg-secondary/5 border-secondary/20"
                  : token.lpStatus === "locked"
                    ? "bg-warning/5 border-warning/20"
                    : "bg-danger/5 border-danger/20"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`material-symbols-outlined text-xl ${
                    token.lpStatus === "burned"
                      ? "text-secondary"
                      : token.lpStatus === "locked"
                        ? "text-warning"
                        : "text-danger"
                  }`}
                >
                  {token.lpStatus === "burned"
                    ? "local_fire_department"
                    : token.lpStatus === "locked"
                      ? "lock"
                      : "lock_open"}
                </span>
                <div>
                  <span
                    className={`text-sm font-bold ${
                      token.lpStatus === "burned"
                        ? "text-secondary"
                        : token.lpStatus === "locked"
                          ? "text-warning"
                          : "text-danger"
                    }`}
                  >
                    LP{" "}
                    {token.lpStatus === "burned"
                      ? "Burned (100% Permanent)"
                      : token.lpStatus === "locked"
                        ? "Locked"
                        : "Unlocked — HIGH RISK"}
                  </span>
                  <p className="text-xs text-text-muted mt-0.5">
                    {token.lpStatus === "burned"
                      ? "Liquidity pool tokens have been burned. The dev cannot withdraw liquidity. This is the safest state."
                      : token.lpStatus === "locked"
                        ? "Liquidity is locked in a smart contract. The dev cannot withdraw until the lock expires. Check the lock duration on Solscan."
                        : "Liquidity is NOT locked. The dev can withdraw all liquidity at any time, which would crash the token price to zero (classic rug-pull)."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-surface-dark p-4 rounded-lg border border-border-dark text-center">
                <span className="text-xs text-text-muted block mb-1">
                  Liquidity (USD)
                </span>
                <span className="text-white font-bold">
                  ${formatNumber(token.liquidityUsd)}
                </span>
              </div>
              <div className="bg-surface-dark p-4 rounded-lg border border-border-dark text-center">
                <span className="text-xs text-text-muted block mb-1">
                  Primary DEX
                </span>
                <span className="text-white font-bold">{token.dex}</span>
              </div>
              <div className="bg-surface-dark p-4 rounded-lg border border-border-dark text-center">
                <span className="text-xs text-text-muted block mb-1">
                  Liq/MCap Ratio
                </span>
                <span
                  className={`font-bold ${token.liqMcapRatio < 1 ? "text-danger" : token.liqMcapRatio < 5 ? "text-warning" : "text-secondary"}`}
                >
                  {token.liqMcapRatio}%
                </span>
              </div>
            </div>
          </GlassPanel>

          {/* Top Holders — Critical for rug checking */}
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">
                  pie_chart
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Top Holders
                </h3>
              </div>
              {token.topHolders && token.topHolders.length > 0 && (
                <span className="text-xs text-text-muted">
                  Top 1: {token.topHolders[0]?.percentage}%
                </span>
              )}
            </div>
            {token.topHolders && token.topHolders.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-text-secondary text-xs uppercase tracking-wider border-b border-border-dark">
                        <th className="py-3 pr-4 font-medium">#</th>
                        <th className="py-3 pr-4 font-medium">Account</th>
                        <th className="py-3 pr-4 font-medium hidden sm:table-cell">
                          Amount
                        </th>
                        <th className="py-3 pr-4 font-medium">%</th>
                        <th className="py-3 font-medium text-right">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark text-sm">
                      {token.topHolders
                        .slice(0, holdersVisible)
                        .map((holder) => (
                          <tr
                            key={holder.rank}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 pr-4 text-text-muted font-medium">
                              {holder.rank}
                            </td>
                            <td className="py-3 pr-4 text-white font-mono text-xs">
                              <a
                                href={`https://solscan.io/account/${holder.rawAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline transition-colors flex items-center gap-1"
                                title={holder.rawAddress}
                              >
                                {holder.address}
                                <span className="material-symbols-outlined text-[10px] opacity-70">
                                  open_in_new
                                </span>
                              </a>
                            </td>
                            <td className="py-3 pr-4 text-text-secondary hidden sm:table-cell">
                              {formatNumber(holder.quantity)}
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-sm font-medium ${holder.percentage > 20 ? "text-danger" : holder.percentage > 10 ? "text-warning" : "text-white"}`}
                                >
                                  {holder.percentage}%
                                </span>
                                <div className="flex-1 h-1.5 bg-border-dark rounded-full max-w-[60px]">
                                  <div
                                    className={`h-full rounded-full ${
                                      holder.percentage > 20
                                        ? "bg-danger"
                                        : holder.percentage > 10
                                          ? "bg-warning"
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
                              {holder.tag === "WHALE" ||
                              holder.tag === "WHALE ALERT" ? (
                                <span className="text-xs font-bold text-danger bg-danger/10 px-2 flex items-center justify-end gap-1 w-max ml-auto py-0.5 rounded-full border border-danger/20">
                                  <span>🐋</span> {holder.tag}
                                </span>
                              ) : holder.tag === "FISH" ? (
                                <span className="text-xs font-bold text-secondary bg-secondary/10 flex items-center justify-end gap-1 w-max ml-auto px-2 py-0.5 rounded-full border border-secondary/20">
                                  <span>🐟</span> FISH
                                </span>
                              ) : holder.tag === "SHRIMP" ? (
                                <span className="text-xs font-bold text-warning bg-warning/10 flex items-center justify-end gap-1 w-max ml-auto px-2 py-0.5 rounded-full border border-warning/20">
                                  <span>🦐</span> SHRIMP
                                </span>
                              ) : holder.tag === "PLANKTON" ? (
                                <span className="text-xs font-bold text-text-muted bg-surface-dark flex items-center justify-end gap-1 w-max ml-auto px-2 py-0.5 rounded-full border border-border-dark">
                                  <span>🦠</span> PLANKTON
                                </span>
                              ) : (
                                <span className="text-xs text-text-muted">
                                  None
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {(token.topHolders.length > holdersVisible ||
                  holdersVisible > 10) && (
                  <div className="flex justify-center gap-3 pt-4 border-t border-border-dark mt-2">
                    {holdersVisible > 10 && (
                      <button
                        onClick={() => setHoldersVisible(10)}
                        className="px-6 py-2.5 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/50 text-text-secondary font-semibold text-xs transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">
                          expand_less
                        </span>
                        Show Less
                      </button>
                    )}
                    {token.topHolders.length > holdersVisible && (
                      <button
                        onClick={() => setHoldersVisible((c) => c + 10)}
                        className="px-6 py-2.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary font-semibold text-xs transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">
                          expand_more
                        </span>
                        Show More ({token.topHolders.length - holdersVisible}{" "}
                        remaining)
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-surface-dark/50 rounded-lg border border-border-dark border-dashed">
                <span className="material-symbols-outlined text-4xl mb-3 text-text-muted">
                  account_balance_wallet
                </span>
                <p className="text-white font-medium">Data Unavailable</p>
                <p className="text-sm text-text-muted mt-1 max-w-sm mx-auto">
                  Unable to fetch top holders. Check network or RPC keys.
                </p>
              </div>
            )}
          </GlassPanel>
        </div>

        {/* ========= RIGHT COLUMN: Market Data, Quick Links & Activity (Secondary) ========= */}
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
              <button
                onClick={downloadReport}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/50 transition-colors cursor-pointer w-full"
              >
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
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">
                  electric_bolt
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Activity
                </h3>
              </div>
              <a
                href={`https://solscan.io/token/${token.address}#transfers`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-secondary bg-secondary/10 hover:bg-secondary/20 transition-colors px-2.5 py-1 rounded-full border border-secondary/20 flex items-center gap-1"
              >
                Live Trades
                <span className="material-symbols-outlined text-[12px]">
                  open_in_new
                </span>
              </a>
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
                    <p className="text-sm text-white break-words">
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
