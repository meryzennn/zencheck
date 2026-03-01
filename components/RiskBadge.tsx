interface RiskBadgeProps {
  score: number;
  showScore?: boolean;
}

export function getRiskLevel(score: number) {
  if (score >= 80) return { label: "Safe", color: "secondary" } as const;
  if (score >= 50) return { label: "Warning", color: "warning" } as const;
  return { label: "Danger", color: "danger" } as const;
}

const colorMap = {
  secondary: {
    bg: "bg-secondary/10",
    text: "text-secondary",
    border: "border-secondary/20",
  },
  warning: {
    bg: "bg-warning/10",
    text: "text-warning",
    border: "border-warning/20",
  },
  danger: {
    bg: "bg-danger/10",
    text: "text-danger",
    border: "border-danger/20",
  },
};

export default function RiskBadge({ score, showScore = true }: RiskBadgeProps) {
  const { label, color } = getRiskLevel(score);
  const styles = colorMap[color];

  return (
    <span
      className={`badge-animate inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text} border ${styles.border}`}
    >
      {showScore ? `${label} (${score}/100)` : label}
    </span>
  );
}
