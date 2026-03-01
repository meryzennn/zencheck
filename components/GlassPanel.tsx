import { ReactNode } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassPanel({
  children,
  className = "",
  hover = false,
}: GlassPanelProps) {
  return (
    <div
      className={`glass-panel rounded-xl ${
        hover ? "hover:border-primary/50 transition-colors group" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
