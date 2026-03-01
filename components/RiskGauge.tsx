"use client";

import { useEffect, useState } from "react";
import { getRiskLevel } from "./RiskBadge";

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export default function RiskGauge({ score, size = 140 }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const { label, color } = getRiskLevel(score);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const colorMap = {
    secondary: "#4ade80",
    warning: "#eab308",
    danger: "#ef4444",
  };
  const strokeColor = colorMap[color];

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 8px ${strokeColor}60)`,
            transition: "stroke-dashoffset 0.1s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">{animatedScore}</span>
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: strokeColor }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
