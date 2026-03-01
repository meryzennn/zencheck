// Mock data for token analysis — will be replaced with real API calls later
export interface TokenAnalysis {
  name: string;
  symbol: string;
  address: string;
  riskScore: number;
  mintAuthority: "revoked" | "active";
  freezeAuthority: "revoked" | "active";
  updateAuthority: "revoked" | "active";
  lpStatus: "burned" | "locked" | "unlocked";
  dex: string;
  liquidityUsd: number;
  liqMcapRatio: number;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  totalSupply: number;
  circulatingSupply: number;
  decimals: number;
  topHolders: {
    rank: number;
    address: string;
    quantity: number;
    percentage: number;
    tag?: string;
  }[];
  recentActivity: {
    type: "buy" | "sell";
    description: string;
    time: string;
  }[];
}

const mockTokens: Record<string, TokenAnalysis> = {
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
    name: "BONK",
    symbol: "$BONK",
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    riskScore: 98,
    mintAuthority: "revoked",
    freezeAuthority: "revoked",
    updateAuthority: "revoked",
    lpStatus: "burned",
    dex: "Raydium",
    liquidityUsd: 5_425_890,
    liqMcapRatio: 12.5,
    price: 0.00003421,
    priceChange24h: 8.23,
    marketCap: 3_420_000,
    volume24h: 892_000,
    totalSupply: 1_000_000_000,
    circulatingSupply: 856_238_096,
    decimals: 9,
    topHolders: [
      {
        rank: 1,
        address: "Fxb9...2a8e",
        quantity: 120_000_000,
        percentage: 12.0,
        tag: "WHALE ALERT",
      },
      { rank: 2, address: "8z2...78k", quantity: 45_000_000, percentage: 4.5 },
      { rank: 3, address: "Ax1...89e", quantity: 32_100_000, percentage: 3.2 },
      { rank: 4, address: "Pd3...x9f", quantity: 28_000_000, percentage: 2.8 },
      { rank: 5, address: "Kz7...m2p", quantity: 22_500_000, percentage: 2.25 },
    ],
    recentActivity: [
      {
        type: "buy",
        description: "Buy 0.5 SOL for 360K $BONK",
        time: "3 mins ago",
      },
      {
        type: "sell",
        description: "Sell 1.2M $BONK for 4.3 SOL",
        time: "5 mins ago",
      },
      {
        type: "buy",
        description: "Buy 2.1 SOL for 730K $BONK",
        time: "8 mins ago",
      },
    ],
  },
  EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: {
    name: "dogwifhat",
    symbol: "$WIF",
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    riskScore: 65,
    mintAuthority: "revoked",
    freezeAuthority: "revoked",
    updateAuthority: "active",
    lpStatus: "locked",
    dex: "Raydium",
    liquidityUsd: 2_100_000,
    liqMcapRatio: 8.2,
    price: 1.42,
    priceChange24h: -3.5,
    marketCap: 25_600_000,
    volume24h: 1_200_000,
    totalSupply: 998_926_392,
    circulatingSupply: 998_926_392,
    decimals: 6,
    topHolders: [
      {
        rank: 1,
        address: "5nR...j8t",
        quantity: 180_000_000,
        percentage: 18.0,
        tag: "WHALE ALERT",
      },
      {
        rank: 2,
        address: "Qw2...p4a",
        quantity: 95_000_000,
        percentage: 9.5,
        tag: "WHALE ALERT",
      },
      { rank: 3, address: "Lm4...k9s", quantity: 42_000_000, percentage: 4.2 },
      { rank: 4, address: "Rt7...n3d", quantity: 35_000_000, percentage: 3.5 },
      { rank: 5, address: "Vb9...h1w", quantity: 21_000_000, percentage: 2.1 },
    ],
    recentActivity: [
      {
        type: "sell",
        description: "Sell 5K $WIF for 12.3 SOL",
        time: "1 min ago",
      },
      {
        type: "buy",
        description: "Buy 8.5 SOL for 3.2K $WIF",
        time: "4 mins ago",
      },
    ],
  },
};

export function getTokenAnalysis(address: string): TokenAnalysis | null {
  if (mockTokens[address]) return mockTokens[address];

  // Generate mock data for any unknown address
  const hashCode = address.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);

  const score = Math.abs(hashCode % 100);
  const isSafe = score >= 80;
  const isMid = score >= 50;

  return {
    name: "Unknown Token",
    symbol: "$UNK",
    address,
    riskScore: score,
    mintAuthority: isSafe ? "revoked" : "active",
    freezeAuthority: isSafe ? "revoked" : isMid ? "revoked" : "active",
    updateAuthority: isSafe ? "revoked" : "active",
    lpStatus: isSafe ? "burned" : isMid ? "locked" : "unlocked",
    dex: "Raydium",
    liquidityUsd: Math.abs(hashCode % 5_000_000),
    liqMcapRatio: Math.abs(hashCode % 25),
    price: Math.abs((hashCode % 10000) / 100000),
    priceChange24h: (hashCode % 40) - 20,
    marketCap: Math.abs(hashCode % 10_000_000),
    volume24h: Math.abs(hashCode % 2_000_000),
    totalSupply: 1_000_000_000,
    circulatingSupply: Math.abs(hashCode % 900_000_000) + 100_000_000,
    decimals: 9,
    topHolders: [
      {
        rank: 1,
        address: `${address.slice(0, 4)}...${address.slice(-4)}`,
        quantity: 120_000_000,
        percentage: isSafe ? 5.2 : 35.0,
        tag: isSafe ? undefined : "WHALE ALERT",
      },
      { rank: 2, address: "Ab2...x9k", quantity: 45_000_000, percentage: 4.5 },
      { rank: 3, address: "Cd3...m7p", quantity: 32_000_000, percentage: 3.2 },
    ],
    recentActivity: [
      {
        type: "buy",
        description: "Buy 1.0 SOL for unknown token",
        time: "2 mins ago",
      },
      {
        type: "sell",
        description: "Sell tokens for 0.3 SOL",
        time: "6 mins ago",
      },
    ],
  };
}
