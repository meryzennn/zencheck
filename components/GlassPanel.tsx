import { ReactNode, CSSProperties } from "react";

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export default function GlassPanel({
  children,
  className = "",
  hover = false,
  style,
}: GlassPanelProps) {
  return (
    <div
      className={`glass-panel rounded-xl ${
        hover ? "hover:border-primary/50 transition-colors group" : ""
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
