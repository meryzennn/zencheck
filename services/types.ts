export interface TokenAnalysis {
  name: string;
  symbol: string;
  address: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  riskScore: number;
  mintAuthority: "revoked" | "active";
  mintAuthorityAddress: string | null;
  freezeAuthority: "revoked" | "active";
  freezeAuthorityAddress: string | null;
  updateAuthority: "revoked" | "active";
  lpStatus: "burned" | "locked" | "unlocked";
  dex: string;
  liquidityUsd: number;
  liqMcapRatio: number;
  price: number;
  priceNative: string;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  totalSupply: number;
  circulatingSupply: number;
  decimals: number;
  topHolders: {
    rank: number;
    address: string;
    rawAddress: string;
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
