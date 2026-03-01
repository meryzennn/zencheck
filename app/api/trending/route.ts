import { NextResponse } from "next/server";
import { tokenAnalysisService } from "../../../services/tokenAnalysis";

interface DexScreenerBoost {
  chainId: string;
  tokenAddress: string;
  description?: string;
  totalAmount: number;
  url?: string;
}

export async function GET() {
  try {
    // Fetch REAL trending tokens from DexScreener Boosted API (chain-wide, not local searches)
    const res = await fetch("https://api.dexscreener.com/token-boosts/top/v1", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`DexScreener Boosted API error: ${res.status}`);
    }

    const boosts: DexScreenerBoost[] = await res.json();

    // Filter only Solana tokens and take top 30
    const solanaTokens = boosts
      .filter((b) => b.chainId === "solana")
      .slice(0, 30);

    // Enrich each token with our own risk analysis
    const enrichedTrending = await Promise.all(
      solanaTokens.map(async (t) => {
        try {
          const analysis = await tokenAnalysisService.analyzeToken(
            t.tokenAddress,
            "system",
          );

          return {
            address: t.tokenAddress,
            name: analysis?.name || t.description || "Unknown Token",
            symbol: analysis?.symbol || "$UNK",
            score: analysis?.riskScore ?? 50,
            searches: t.totalAmount,
            logoUrl: analysis?.logoUrl || null,
            trend:
              analysis?.priceChange24h && analysis.priceChange24h >= 0
                ? "up"
                : "down",
            price: analysis?.price || 0,
            priceNative: analysis?.priceNative || "0",
            priceChange24h: analysis?.priceChange24h || 0,
            marketCap: analysis?.marketCap || 0,
            volume24h: analysis?.volume24h || 0,
          };
        } catch {
          return {
            address: t.tokenAddress,
            name: t.description || "Unknown Token",
            symbol: "$UNK",
            score: 50,
            searches: t.totalAmount,
            logoUrl: null,
            trend: "down",
            price: 0,
            priceNative: "0",
            priceChange24h: 0,
            marketCap: 0,
            volume24h: 0,
          };
        }
      }),
    );

    return NextResponse.json(enrichedTrending);
  } catch (error) {
    console.error("Error fetching trending:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
