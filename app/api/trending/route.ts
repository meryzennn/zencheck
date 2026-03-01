import { NextResponse } from "next/server";
import { databaseService } from "../../../services/databaseService";
import { tokenAnalysisService } from "../../../services/tokenAnalysis";

export async function GET() {
  try {
    const trending = await databaseService.getTrendingTokens();

    // Fetch actual data for trending tokens
    const enrichedTrending = await Promise.all(
      trending.map(async (t) => {
        // We use tokenAnalysisService to get real cached/fetched data
        // Pass "system" as IP to avoid skewing search counts
        const analysis = await tokenAnalysisService.analyzeToken(
          t.address,
          "system",
        );

        return {
          address: t.address,
          name: analysis?.name || "Unknown Token",
          symbol: analysis?.symbol || "$UNK",
          score: analysis?.riskScore ?? 50,
          searches: t.count,
          trend:
            analysis?.priceChange24h && analysis.priceChange24h >= 0
              ? "up"
              : "down",
          price: analysis?.price || 0,
          priceNative: analysis?.priceNative || "0",
          priceChange24h: analysis?.priceChange24h || 0,
        };
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
