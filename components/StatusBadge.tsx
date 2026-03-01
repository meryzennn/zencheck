export function StatusBadge({
  status,
  label,
}: {
  status: "revoked" | "active";
  label: string;
}) {
  const isRevoked = status === "revoked";
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span
          className={`material-symbols-outlined text-lg ${
            isRevoked ? "text-secondary" : "text-danger"
          }`}
        >
          {isRevoked ? "check_circle" : "warning"}
        </span>
        <span className="text-sm text-text-primary font-medium">{label}</span>
      </div>
      <span
        className={`badge-animate text-xs font-bold px-3 py-1 rounded-full ${
          isRevoked
            ? "bg-secondary/10 text-secondary border border-secondary/20"
            : "bg-danger/10 text-danger border border-danger/20"
        }`}
      >
        {isRevoked ? "REVOKED" : "ACTIVE"}
      </span>
    </div>
  );
}

export function LpStatusBadge({
  status,
}: {
  status: "burned" | "locked" | "unlocked";
}) {
  const config = {
    burned: {
      icon: "local_fire_department",
      label: "Burned",
      color: "text-secondary",
      bg: "bg-secondary/10 border-secondary/20",
    },
    locked: {
      icon: "lock",
      label: "Locked",
      color: "text-warning",
      bg: "bg-warning/10 border-warning/20",
    },
    unlocked: {
      icon: "lock_open",
      label: "Unlocked",
      color: "text-danger",
      bg: "bg-danger/10 border-danger/20",
    },
  };

  const c = config[status];
  return (
    <span
      className={`badge-animate inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${c.bg} ${c.color}`}
    >
      <span className="material-symbols-outlined text-sm">{c.icon}</span>
      {c.label}
    </span>
  );
}
