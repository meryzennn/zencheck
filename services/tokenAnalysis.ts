import { databaseService } from "./databaseService";
import { solanaRpcService } from "./solanaRpcService";
import { externalApisService } from "./externalApis";
import { TokenAnalysis } from "./types";

export const tokenAnalysisService = {
  async analyzeToken(
    address: string,
    clientIp: string = "unknown",
  ): Promise<TokenAnalysis | null> {
    // 1. Record search for trending
    await databaseService.recordSearch(address, clientIp);

    // 2. Check Cache
    const cached = await databaseService.getTokenCache(address);
    if (cached) return cached;

    // 3. Fetch from RPC and DexScreener API in parallel
    const [rpcData, holders, marketData] = await Promise.all([
      solanaRpcService.getTokenAuthorities(address),
      solanaRpcService.getTopHolders(address),
      externalApisService.getMarketData(address),
    ]);

    // 4. Calculate Risk Score based on real data
    let riskScore = 100;

    // Authority checks (higher penalty for active authorities)
    if (rpcData.mintAuthority === "active") riskScore -= 20;
    if (rpcData.freezeAuthority === "active") riskScore -= 15;
    if (rpcData.updateAuthority === "active") riskScore -= 10;

    // Liquidity checks
    if (marketData.lpStatus === "unlocked") riskScore -= 25;
    else if (marketData.lpStatus === "locked") riskScore -= 5;
    // burned = no penalty

    if (marketData.liquidityUsd < 1000) riskScore -= 15;
    else if (marketData.liquidityUsd < 10000) riskScore -= 10;
    else if (marketData.liquidityUsd < 50000) riskScore -= 5;

    // Market cap check
    if (marketData.marketCap < 10000) riskScore -= 5;

    // Top holder concentration check
    if (holders[0] && holders[0].percentage > 50) riskScore -= 15;
    else if (holders[0] && holders[0].percentage > 20) riskScore -= 10;
    else if (holders[0] && holders[0].percentage > 10) riskScore -= 5;

    // Liq/MCap ratio (too low = risky)
    if (marketData.liqMcapRatio < 1) riskScore -= 5;

    // Ensure score is between 0 and 100
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Use real token supply data; calculate circulating from market cap / price
    const totalSupply = rpcData.totalSupply || 0;
    const circulatingSupply =
      marketData.price > 0 && marketData.marketCap > 0
        ? marketData.marketCap / marketData.price
        : totalSupply * 0.8;

    // Combine data
    const analysisInfo: TokenAnalysis = {
      name: marketData.name,
      symbol: marketData.symbol,
      address,
      logoUrl: marketData.logoUrl,
      bannerUrl: marketData.bannerUrl,
      riskScore,
      mintAuthority: rpcData.mintAuthority,
      freezeAuthority: rpcData.freezeAuthority,
      updateAuthority: rpcData.updateAuthority,
      decimals: rpcData.decimals,
      totalSupply,
      circulatingSupply,
      topHolders: holders,
      recentActivity: marketData.recentActivity,
      price: marketData.price,
      priceNative: marketData.priceNative,
      priceChange24h: marketData.priceChange24h,
      liquidityUsd: marketData.liquidityUsd,
      marketCap: marketData.marketCap,
      volume24h: marketData.volume24h,
      dex: marketData.dex,
      lpStatus: marketData.lpStatus,
      liqMcapRatio: marketData.liqMcapRatio,
    };

    // 5. Save to Cache
    await databaseService.saveTokenCache(address, analysisInfo);

    return analysisInfo;
  },
};
