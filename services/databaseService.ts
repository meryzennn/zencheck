import { TokenAnalysis } from "./types";

// In-memory mock database to replace Supabase for now.
const tokenCache = new Map<
  string,
  { data: TokenAnalysis; updatedAt: number }
>();
const searches: { address: string; searchedAt: number; clientIp: string }[] =
  [];

export const databaseService = {
  async getTokenCache(address: string): Promise<TokenAnalysis | null> {
    const cached = tokenCache.get(address);
    if (!cached) return null;

    // Cache valid for 5 seconds for real-time updates
    if (Date.now() - cached.updatedAt > 5 * 1000) {
      return null;
    }
    return cached.data;
  },

  async saveTokenCache(address: string, data: TokenAnalysis): Promise<void> {
    tokenCache.set(address, { data, updatedAt: Date.now() });
  },

  async recordSearch(address: string, clientIp: string): Promise<void> {
    searches.push({ address, searchedAt: Date.now(), clientIp });
  },

  async getTrendingTokens(): Promise<{ address: string; count: number }[]> {
    // Return top 10 most searched tokens in the last 24 hours
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const recentSearches = searches.filter((s) => s.searchedAt > last24h);

    const counts = new Map<string, number>();
    for (const search of recentSearches) {
      counts.set(search.address, (counts.get(search.address) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([address, count]) => ({ address, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  },
};
