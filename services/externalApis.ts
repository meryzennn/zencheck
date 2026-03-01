// Real implementation using DexScreener API (free, no API key needed)

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceNative?: string;
  priceChange: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
  volume?: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  txns?: {
    h24: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    m5: { buys: number; sells: number };
  };
  labels?: string[];
  info?: {
    imageUrl?: string;
    header?: string;
    websites?: { url: string; label: string }[];
    socials?: { url: string; type: string }[];
  };
}

export interface DexScreenerResult {
  name: string;
  symbol: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  price: number;
  priceNative: string;
  priceChange24h: number;
  liquidityUsd: number;
  marketCap: number;
  volume24h: number;
  dex: string;
  lpStatus: "burned" | "locked" | "unlocked";
  liqMcapRatio: number;
  recentActivity: {
    type: "buy" | "sell";
    description: string;
    time: string;
  }[];
}

export const externalApisService = {
  async getMarketData(address: string): Promise<DexScreenerResult> {
    try {
      const response = await fetch(
        `https://api.dexscreener.com/tokens/v1/solana/${address}`,
        {
          headers: { Accept: "application/json" },
          cache: "no-store", // Bypass Next.js cache for true real-time polling
        },
      );

      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }

      const pairs: DexScreenerPair[] = await response.json();

      if (!pairs || pairs.length === 0) {
        throw new Error("No pairs found for this token");
      }

      // Sort by liquidity to find the most active/relevant pair
      const sortedPairs = pairs.sort(
        (a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0),
      );
      const bestPair = sortedPairs[0];

      // Get token logo from any pair that has info, fallback to identicon
      const pairWithLogo = pairs.find((p) => p.info?.imageUrl);
      const logoUrl =
        pairWithLogo?.info?.imageUrl ||
        `https://api.dicebear.com/9.x/identicon/svg?seed=${address}&backgroundColor=111111&rowColor=34d399,60a5fa,a78bfa`;

      const pairWithBanner = pairs.find((p) => p.info?.header);
      const bannerUrl = pairWithBanner?.info?.header || null;

      // Determine LP status from labels
      let lpStatus: "burned" | "locked" | "unlocked" = "unlocked";
      for (const pair of pairs) {
        if (pair.labels?.includes("bp")) {
          lpStatus = "burned";
          break;
        }
        if (pair.labels?.includes("lp")) {
          lpStatus = "locked";
        }
      }

      const price = parseFloat(bestPair.priceUsd) || 0;
      const priceNative = bestPair.priceNative || "0";
      const liquidityUsd = bestPair.liquidity?.usd || 0;
      const marketCap = bestPair.marketCap || bestPair.fdv || 0;
      const volume24h = bestPair.volume?.h24 || 0;
      const priceChange24h = bestPair.priceChange?.h24 || 0;

      // Calculate Liq/MCap ratio
      const liqMcapRatio = marketCap > 0 ? (liquidityUsd / marketCap) * 100 : 0;

      // Build recent activity from txns data
      const recentActivity = this.buildRecentActivity(bestPair);

      return {
        name:
          bestPair.baseToken.name ||
          bestPair.baseToken.symbol ||
          `Unknown (${address.slice(0, 4)}...${address.slice(-4)})`,
        symbol: bestPair.baseToken.symbol,
        logoUrl,
        bannerUrl,
        price,
        priceNative,
        priceChange24h,
        liquidityUsd,
        marketCap,
        volume24h,
        dex: this.formatDexName(bestPair.dexId),
        lpStatus,
        liqMcapRatio: parseFloat(liqMcapRatio.toFixed(2)),
        recentActivity,
      };
    } catch (error) {
      console.error("DexScreener API error:", error);
      // Return fallback data if API fails
      return {
        name: "Unknown Token",
        symbol: "???",
        logoUrl: null,
        bannerUrl: null,
        price: 0,
        priceNative: "0",
        priceChange24h: 0,
        liquidityUsd: 0,
        marketCap: 0,
        volume24h: 0,
        dex: "Unknown",
        lpStatus: "unlocked",
        liqMcapRatio: 0,
        recentActivity: [],
      };
    }
  },

  formatDexName(dexId: string): string {
    const dexNames: Record<string, string> = {
      raydium: "Raydium",
      orca: "Orca",
      meteora: "Meteora",
      jupiter: "Jupiter",
      lifinity: "Lifinity",
      phoenix: "Phoenix",
      openbook: "OpenBook",
    };
    return dexNames[dexId] || dexId.charAt(0).toUpperCase() + dexId.slice(1);
  },

  buildRecentActivity(
    pair: DexScreenerPair,
  ): { type: "buy" | "sell"; description: string; time: string }[] {
    const activity: {
      type: "buy" | "sell";
      description: string;
      time: string;
    }[] = [];

    if (pair.txns) {
      const m5 = pair.txns.m5;
      if (m5) {
        if (m5.buys > 0) {
          activity.push({
            type: "buy",
            description: `${m5.buys} buys in the last 5 minutes`,
            time: "Last 5m",
          });
        }
        if (m5.sells > 0) {
          activity.push({
            type: "sell",
            description: `${m5.sells} sells in the last 5 minutes`,
            time: "Last 5m",
          });
        }
      }

      const h1 = pair.txns.h1;
      if (h1 && activity.length < 3) {
        if (h1.buys > 0) {
          activity.push({
            type: "buy",
            description: `${h1.buys} buys in the last hour`,
            time: "Last 1h",
          });
        }
        if (h1.sells > 0) {
          activity.push({
            type: "sell",
            description: `${h1.sells} sells in the last hour`,
            time: "Last 1h",
          });
        }
      }

      const h24 = pair.txns.h24;
      if (h24 && activity.length < 5) {
        activity.push({
          type: "buy",
          description: `${h24.buys} buys / ${h24.sells} sells in 24h (Total: ${h24.buys + h24.sells})`,
          time: "Last 24h",
        });
      }
    }

    return activity.length > 0
      ? activity
      : [
          {
            type: "buy" as const,
            description: "No recent activity data available",
            time: "N/A",
          },
        ];
  },
};
