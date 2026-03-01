import { NextResponse } from "next/server";
import { tokenAnalysisService } from "../../../services/tokenAnalysis";

export const dynamic = "force-dynamic";

let cachedData: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function GET() {
  try {
    const now = Date.now();

    // Return cached data if within duration and exists
    if (cachedData && now - lastFetchTime < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Fetch REAL organic trending tokens from GeckoTerminal API
    const res = await fetch(
      "https://api.geckoterminal.com/api/v2/networks/solana/trending_pools",
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      if (res.status === 429 && cachedData) {
        // Return stale cache if rate limited
        return NextResponse.json(cachedData);
      }
      throw new Error(`GeckoTerminal API error: ${res.status}`);
    }

    const { data } = await res.json();
    const WRAPPED_SOL = "So11111111111111111111111111111111111111112";

    const solanaTokens = data
      .map((pool: any) => {
        const baseId = pool.relationships?.base_token?.data?.id?.replace(
          "solana_",
          "",
        );
        const quoteId = pool.relationships?.quote_token?.data?.id?.replace(
          "solana_",
          "",
        );

        const tokenAddress = baseId === WRAPPED_SOL ? quoteId : baseId;
        const nameParts = pool.attributes?.name?.split(" / ") || ["Unknown"];
        const symbol =
          nameParts[0] === "SOL" || nameParts[0] === "WSOL"
            ? nameParts[1]
            : nameParts[0];

        return {
          tokenAddress,
          description: pool.attributes?.name || "Unknown Pool",
          symbol,
          totalAmount: pool.attributes?.transactions?.h24?.buys || 0, // Mock searches/boosts with 24h buys
        };
      })
      .filter((t: any) => t.tokenAddress && t.tokenAddress !== WRAPPED_SOL)
      .slice(0, 30);

    // Enrich each token with our own risk analysis
    const enrichedTrending = await Promise.all(
      solanaTokens.map(async (t: any) => {
        try {
          const analysis = await tokenAnalysisService.analyzeToken(
            t.tokenAddress,
            "system",
          );

          return {
            address: t.tokenAddress,
            name: analysis?.name || t.description || "Unknown Token",
            symbol: analysis?.symbol || t.symbol || "$UNK",
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
            symbol: t.symbol || "$UNK",
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

    // Update the cache
    cachedData = enrichedTrending;
    lastFetchTime = now;

    return NextResponse.json(enrichedTrending);
  } catch (error) {
    console.error("Error fetching trending:", error);

    // Return stale cache as fallback rather than empty payload
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
