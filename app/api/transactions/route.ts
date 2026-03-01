import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

const rpcUrl =
  process.env.ALCHEMY_RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(rpcUrl, "confirmed");

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json(
      { error: "Missing wallet address" },
      { status: 400 },
    );
  }

  try {
    new PublicKey(wallet);
  } catch {
    return NextResponse.json(
      { error: "Invalid Solana wallet address" },
      { status: 400 },
    );
  }

  try {
    const pubkey = new PublicKey(wallet);

    // Fetch recent confirmed signatures
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: 20,
    });

    // Fetch parsed transaction details for each signature
    const txSignatures = signatures.map((s) => s.signature);
    const transactions = await connection.getParsedTransactions(txSignatures, {
      maxSupportedTransactionVersion: 0,
    });

    const results = signatures.map((sig, i) => {
      const tx = transactions[i];
      const meta = tx?.meta;
      const blockTime = sig.blockTime;
      const err = sig.err;

      // Determine tx type and details from parsed instructions
      let type: "transfer" | "swap" | "unknown" = "unknown";
      let description = "";
      let solAmount: number | null = null;

      if (tx?.transaction?.message?.instructions) {
        for (const ix of tx.transaction.message.instructions) {
          if ("parsed" in ix) {
            const parsed = ix.parsed;
            if (
              parsed?.type === "transfer" ||
              parsed?.type === "transferChecked"
            ) {
              type = "transfer";
              const info = parsed.info;
              if (info?.lamports) {
                solAmount = info.lamports / 1e9;
                const isOutgoing = info.source === wallet;
                description = isOutgoing
                  ? `Sent ${solAmount.toFixed(4)} SOL`
                  : `Received ${solAmount.toFixed(4)} SOL`;
              } else if (info?.tokenAmount) {
                const amount =
                  info.tokenAmount.uiAmountString ||
                  info.tokenAmount.uiAmount ||
                  "?";
                const isOutgoing =
                  info.authority === wallet || info.source === wallet;
                description = isOutgoing
                  ? `Sent ${amount} tokens`
                  : `Received ${amount} tokens`;
              }
            }
          }
        }
      }

      // Fallback: detect SOL transfer from balance changes
      if (type === "unknown" && meta) {
        const accountKeys = tx?.transaction?.message?.accountKeys || [];
        const walletIndex = accountKeys.findIndex(
          (k) => k.pubkey.toBase58() === wallet,
        );
        if (walletIndex !== -1 && meta.preBalances && meta.postBalances) {
          const diff =
            (meta.postBalances[walletIndex] - meta.preBalances[walletIndex]) /
            1e9;
          if (Math.abs(diff) > 0.0001) {
            type = "transfer";
            solAmount = Math.abs(diff);
            description =
              diff > 0
                ? `Received ${solAmount.toFixed(4)} SOL`
                : `Sent ${solAmount.toFixed(4)} SOL`;
          }
        }

        // Check if it involved token program (likely a swap)
        const programIds = accountKeys.map((k) => k.pubkey.toBase58());
        if (
          programIds.some(
            (id) =>
              id.includes("swap") ||
              id.includes("Swap") ||
              id === "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" || // Jupiter
              id === "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", // Raydium
          )
        ) {
          type = "swap";
          if (!description) description = "Token Swap";
        }
      }

      // Final fallback
      if (!description) {
        description = err ? "Failed Transaction" : "Contract Interaction";
      }

      // Calculate fee
      const fee = meta?.fee ? meta.fee / 1e9 : 0;

      return {
        signature: sig.signature,
        blockTime: blockTime || null,
        status: err ? "failed" : "success",
        type,
        description,
        fee,
        solAmount,
      };
    });

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
      },
    });
  } catch (error) {
    console.error("Transaction fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
