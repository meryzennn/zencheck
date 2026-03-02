"use client";

import { forwardRef } from "react";
import type { TokenAnalysis } from "@/services/types";

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

function getRiskColor(score: number) {
  if (score <= 30) return { bg: "#22c55e", text: "#dcfce7", label: "SAFE" };
  if (score <= 60) return { bg: "#eab308", text: "#fef9c3", label: "WARNING" };
  return { bg: "#ef4444", text: "#fee2e2", label: "DANGER" };
}

interface ReportCardProps {
  token: TokenAnalysis;
  logoBase64?: string | null;
}

const ReportCard = forwardRef<HTMLDivElement, ReportCardProps>(
  ({ token, logoBase64 }, ref) => {
    const risk = getRiskColor(token.riskScore);
    const now = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        ref={ref}
        style={{
          width: 800,
          padding: 40,
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
          color: "#f8fafc",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {(logoBase64 || token.logoUrl) && (
              <img
                src={logoBase64 || token.logoUrl || ""}
                alt=""
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: "2px solid #a855f7",
                }}
              />
            )}
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                {token.name}{" "}
                <span
                  style={{ color: "#94a3b8", fontWeight: 600, fontSize: 20 }}
                >
                  ${token.symbol}
                </span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  fontFamily: "monospace",
                  marginTop: 2,
                }}
              >
                {token.address}
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#a855f7",
                letterSpacing: "-0.5px",
              }}
            >
              Zen<span style={{ color: "#f8fafc" }}>Check</span>
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
              Token Security Report
            </div>
          </div>
        </div>

        {/* Risk Score Banner */}
        <div
          style={{
            background: `linear-gradient(135deg, ${risk.bg}15, ${risk.bg}08)`,
            border: `1px solid ${risk.bg}40`,
            borderRadius: 16,
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "#94a3b8",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Risk Assessment
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: risk.bg,
                marginTop: 4,
              }}
            >
              {risk.label}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: risk.bg }}>
              {token.riskScore}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>/ 100</div>
          </div>
        </div>

        {/* Security Checks Row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          {[
            {
              label: "Mint Authority",
              value: token.mintAuthority,
              good: "revoked",
            },
            {
              label: "Freeze Authority",
              value: token.freezeAuthority,
              good: "revoked",
            },
            {
              label: "Update Authority",
              value: token.updateAuthority,
              good: "revoked",
            },
            { label: "LP Status", value: token.lpStatus, good: "burned" },
          ].map((item) => {
            const isGood = item.value === item.good;
            const isWarn =
              item.label === "LP Status" && item.value === "locked";
            const color = isGood ? "#22c55e" : isWarn ? "#eab308" : "#ef4444";
            return (
              <div
                key={item.label}
                style={{
                  flex: 1,
                  background: `${color}10`,
                  border: `1px solid ${color}30`,
                  borderRadius: 12,
                  padding: "14px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "#94a3b8",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color }}>
                  {isGood ? "✓" : isWarn ? "~" : "✗"}{" "}
                  {item.value.charAt(0).toUpperCase() + item.value.slice(1)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Market Data Grid */}
        <div
          style={{
            background: "#0f172a80",
            border: "1px solid #1e293b",
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            Market Data
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 0 }}>
            {[
              { label: "Price", value: `${formatPrice(token.price)}` },
              { label: "Price (SOL)", value: `${token.priceNative} SOL` },
              {
                label: "24h Change",
                value: `${token.priceChange24h >= 0 ? "+" : ""}${token.priceChange24h.toFixed(2)}%`,
                color: token.priceChange24h >= 0 ? "#22c55e" : "#ef4444",
              },
              {
                label: "Market Cap",
                value: `$${formatNumber(token.marketCap)}`,
              },
              {
                label: "24h Volume",
                value: `$${formatNumber(token.volume24h)}`,
              },
              {
                label: "Liquidity",
                value: `$${formatNumber(token.liquidityUsd)}`,
              },
              { label: "Liq/MCap Ratio", value: `${token.liqMcapRatio}%` },
              { label: "DEX", value: token.dex },
            ].map((item) => (
              <div key={item.label} style={{ width: "25%", padding: "8px 0" }}>
                <div
                  style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: item.color || "#f8fafc",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supply Info */}
        <div
          style={{
            background: "#0f172a80",
            border: "1px solid #1e293b",
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 16,
            }}
          >
            Supply Information
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>
                Total Supply
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {formatNumber(token.totalSupply)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>
                Circulating Supply
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {formatNumber(token.circulatingSupply)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>
                Decimals
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {token.decimals}
              </div>
            </div>
          </div>
        </div>

        {/* Top Holders */}
        {token.topHolders && token.topHolders.length > 0 && (
          <div
            style={{
              background: "#0f172a80",
              border: "1px solid #1e293b",
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#94a3b8",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 16,
              }}
            >
              Top Holders
            </div>
            {token.topHolders.slice(0, 10).map((h) => {
              const barColor =
                h.percentage > 20
                  ? "#ef4444"
                  : h.percentage > 10
                    ? "#eab308"
                    : "#a855f7";
              return (
                <div
                  key={h.rank}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "7px 0",
                    borderBottom: "1px solid #1e293b20",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      width: 24,
                      fontWeight: 700,
                    }}
                  >
                    #{h.rank}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 11,
                      color: "#94a3b8",
                      fontFamily: "monospace",
                    }}
                  >
                    {h.address}
                  </span>
                  <div style={{ width: 80 }}>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "#1e293b",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(h.percentage * 2, 100)}%`,
                          height: "100%",
                          borderRadius: 3,
                          background: barColor,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: barColor,
                      width: 50,
                      textAlign: "right",
                    }}
                  >
                    {h.percentage}%
                  </span>
                  {h.tag && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: "#ef4444",
                        background: "#ef444415",
                        padding: "2px 8px",
                        borderRadius: 20,
                        border: "1px solid #ef444430",
                      }}
                    >
                      {h.tag}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 16,
            borderTop: "1px solid #1e293b",
          }}
        >
          <div style={{ fontSize: 10, color: "#64748b" }}>
            Generated on {now} • ZenRugCheck © 2026
          </div>
          <div style={{ fontSize: 10, color: "#64748b" }}>
            zenrugcheck.vercel.app • DYOR — Not financial advice
          </div>
        </div>
      </div>
    );
  },
);

ReportCard.displayName = "ReportCard";
export default ReportCard;
