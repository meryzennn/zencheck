"use client";

import { useState } from "react";
import GlassPanel from "@/components/GlassPanel";

interface ChartToken {
  symbol: string;
  name: string;
  valueUsd: number;
  priceChange24h: number;
  logoUrl: string | null;
}

interface PortfolioChartProps {
  tokens: ChartToken[];
  solValueUsd: number;
  totalValueUsd: number;
}

const CHART_COLORS = [
  "#a855f7", // purple (primary)
  "#4ade80", // green (secondary)
  "#f97316", // orange
  "#3b82f6", // blue
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#10b981", // emerald
];

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export default function PortfolioChart({
  tokens,
  solValueUsd,
  totalValueUsd,
}: PortfolioChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Build chart slices: SOL + top tokens, group small ones as "Other"
  const slices: {
    label: string;
    symbol: string;
    value: number;
    color: string;
    percentage: number;
  }[] = [];

  if (totalValueUsd <= 0) return null;

  // Add SOL first
  if (solValueUsd > 0) {
    slices.push({
      label: "Solana",
      symbol: "SOL",
      value: solValueUsd,
      color: CHART_COLORS[0],
      percentage: (solValueUsd / totalValueUsd) * 100,
    });
  }

  // Add tokens with value, up to 7
  const valuedTokens = tokens
    .filter((t) => t.valueUsd >= 0.01)
    .sort((a, b) => b.valueUsd - a.valueUsd);

  const topTokens = valuedTokens.slice(0, 7);
  const otherTokens = valuedTokens.slice(7);

  topTokens.forEach((token, i) => {
    slices.push({
      label: token.name,
      symbol: token.symbol,
      value: token.valueUsd,
      color: CHART_COLORS[(i + 1) % CHART_COLORS.length],
      percentage: (token.valueUsd / totalValueUsd) * 100,
    });
  });

  // Group remaining as "Other"
  const otherValue = otherTokens.reduce((sum, t) => sum + t.valueUsd, 0);
  if (otherValue > 0) {
    slices.push({
      label: "Other",
      symbol: `${otherTokens.length} tokens`,
      value: otherValue,
      color: "#475569",
      percentage: (otherValue / totalValueUsd) * 100,
    });
  }

  // SVG donut chart math
  const size = 200;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  // Build arc segments
  let currentOffset = 0;
  const arcs = slices.map((slice, i) => {
    const dashLength = (slice.percentage / 100) * circumference;
    const dashGap = circumference - dashLength;
    const offset = -currentOffset;
    currentOffset += dashLength;

    return {
      ...slice,
      index: i,
      dashArray: `${dashLength} ${dashGap}`,
      dashOffset: offset,
    };
  });

  // Top holdings bar chart — same data
  const barMax = slices.length > 0 ? slices[0].value : 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Donut Chart */}
      <GlassPanel className="rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-primary text-lg">
            donut_large
          </span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Allocation
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SVG Donut */}
          <div className="relative shrink-0">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="transform -rotate-90"
            >
              {/* Background ring */}
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
              />
              {/* Data arcs */}
              {arcs.map((arc) => (
                <circle
                  key={arc.index}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={
                    hoveredIndex === arc.index ? strokeWidth + 6 : strokeWidth
                  }
                  strokeDasharray={arc.dashArray}
                  strokeDashoffset={arc.dashOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    opacity:
                      hoveredIndex !== null && hoveredIndex !== arc.index
                        ? 0.4
                        : 1,
                    filter:
                      hoveredIndex === arc.index
                        ? `drop-shadow(0 0 8px ${arc.color}66)`
                        : "none",
                  }}
                  onMouseEnter={() => setHoveredIndex(arc.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {hoveredIndex !== null && slices[hoveredIndex] ? (
                <>
                  <span className="text-xs text-text-muted">
                    {slices[hoveredIndex].symbol}
                  </span>
                  <span className="text-lg font-bold text-white">
                    {formatUsd(slices[hoveredIndex].value)}
                  </span>
                  <span className="text-xs text-text-muted">
                    {slices[hoveredIndex].percentage.toFixed(1)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs text-text-muted">Total</span>
                  <span className="text-lg font-bold text-white">
                    {formatUsd(totalValueUsd)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full flex flex-col gap-2 max-h-[200px] overflow-y-auto">
            {slices.map((slice, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  hoveredIndex === i ? "bg-white/5" : "hover:bg-white/[0.02]"
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-white text-xs font-medium flex-1 truncate">
                  {slice.symbol}
                </span>
                <span className="text-text-muted text-xs tabular-nums">
                  {slice.percentage.toFixed(1)}%
                </span>
                <span className="text-text-secondary text-xs font-medium tabular-nums">
                  {formatUsd(slice.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>

      {/* Top Holdings Bar Chart */}
      <GlassPanel className="rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-primary text-lg">
            bar_chart
          </span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Top Holdings
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {slices.slice(0, 8).map((slice, i) => {
            const barWidth = Math.max((slice.value / barMax) * 100, 2);
            return (
              <div
                key={i}
                className={`group transition-all cursor-pointer rounded-lg px-3 py-2.5 ${
                  hoveredIndex === i ? "bg-white/5" : "hover:bg-white/[0.02]"
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-white text-xs font-bold">
                      {slice.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-secondary text-xs font-medium tabular-nums">
                      {formatUsd(slice.value)}
                    </span>
                    <span className="text-text-muted text-xs tabular-nums w-12 text-right">
                      {slice.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Bar */}
                <div className="w-full h-2 bg-border-dark/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: slice.color,
                      opacity:
                        hoveredIndex !== null && hoveredIndex !== i ? 0.4 : 1,
                      boxShadow:
                        hoveredIndex === i
                          ? `0 0 10px ${slice.color}44`
                          : "none",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
