"use client";

import { useState, useEffect } from "react";
import GlassPanel from "@/components/GlassPanel";

interface Transaction {
  signature: string;
  blockTime: number | null;
  status: "success" | "failed";
  type: "transfer" | "swap" | "unknown";
  description: string;
  fee: number;
  solAmount: number | null;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp * 1000).toLocaleDateString();
}

function txIcon(
  type: string,
  description: string,
): { icon: string; color: string } {
  if (description.startsWith("Sent"))
    return { icon: "arrow_upward", color: "text-danger" };
  if (description.startsWith("Received"))
    return { icon: "arrow_downward", color: "text-secondary" };
  if (type === "swap") return { icon: "swap_horiz", color: "text-primary" };
  if (description === "Failed Transaction")
    return { icon: "error_outline", color: "text-danger" };
  return { icon: "receipt_long", color: "text-text-muted" };
}

export default function TransactionHistory({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    let cancelled = false;

    async function fetchTx() {
      try {
        setLoading(true);
        const res = await fetch(`/api/transactions?wallet=${walletAddress}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) setTransactions(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTx();
    return () => {
      cancelled = true;
    };
  }, [walletAddress]);

  const displayed = showAll ? transactions : transactions.slice(0, 8);

  return (
    <GlassPanel className="rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">
            history
          </span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Recent Transactions
          </h3>
        </div>
        <a
          href={`https://solscan.io/account/${walletAddress}#txs`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-xs hover:underline flex items-center gap-0.5"
        >
          View All on Solscan
          <span className="material-symbols-outlined text-[10px]">
            open_in_new
          </span>
        </a>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 animate-stagger-in"
              style={{ animationDelay: `${i * 80}ms` } as React.CSSProperties}
            >
              <div className="w-9 h-9 rounded-full skeleton shrink-0" />
              <div className="flex-1">
                <div className="w-40 h-4 skeleton mb-1.5" />
                <div className="w-24 h-3 skeleton" />
              </div>
              <div className="w-16 h-4 skeleton" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="material-symbols-outlined text-3xl text-text-muted mb-2">
            cloud_off
          </span>
          <p className="text-text-muted text-sm">Unable to load transactions</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="material-symbols-outlined text-3xl text-text-muted mb-2">
            receipt_long
          </span>
          <p className="text-text-muted text-sm">No recent transactions</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-border-dark">
            {displayed.map((tx, i) => {
              const { icon, color } = txIcon(tx.type, tx.description);
              return (
                <div
                  key={tx.signature}
                  className="flex items-center gap-3 py-3 px-1 hover:bg-white/[0.02] rounded-lg transition-colors group animate-stagger-in"
                  style={
                    { animationDelay: `${i * 50}ms` } as React.CSSProperties
                  }
                >
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      tx.status === "failed"
                        ? "bg-danger/10"
                        : tx.description.startsWith("Sent")
                          ? "bg-danger/10"
                          : tx.description.startsWith("Received")
                            ? "bg-secondary/10"
                            : tx.type === "swap"
                              ? "bg-primary/10"
                              : "bg-surface-dark"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-lg ${color}`}
                    >
                      {icon}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          tx.status === "failed"
                            ? "text-danger line-through"
                            : "text-white"
                        }`}
                      >
                        {tx.description}
                      </span>
                      {tx.status === "failed" && (
                        <span className="text-[10px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded border border-danger/20">
                          FAILED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-text-muted text-xs">
                        {tx.blockTime ? timeAgo(tx.blockTime) : "Unknown time"}
                      </span>
                      <span className="text-text-muted text-[10px]">•</span>
                      <span className="text-text-muted text-xs">
                        Fee: {tx.fee.toFixed(5)} SOL
                      </span>
                    </div>
                  </div>

                  {/* Signature link */}
                  <a
                    href={`https://solscan.io/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-primary transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                    title="View on Solscan"
                  >
                    <span className="material-symbols-outlined text-sm">
                      open_in_new
                    </span>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Show more / less */}
          {transactions.length > 8 && (
            <div className="flex justify-center pt-4 border-t border-border-dark mt-2">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-5 py-2 rounded-lg bg-surface-dark border border-border-dark hover:border-primary/40 text-text-secondary text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  {showAll ? "expand_less" : "expand_more"}
                </span>
                {showAll
                  ? "Show Less"
                  : `Show More (${transactions.length - 8} more)`}
              </button>
            </div>
          )}
        </>
      )}
    </GlassPanel>
  );
}
