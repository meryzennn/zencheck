import { databaseService } from "./databaseService";
import { solanaRpcService } from "./solanaRpcService";
import { externalApisService } from "./externalApis";
import { TokenAnalysis } from "./types";

/**
 * ZenRugCheck Risk Score Algorithm — True Rug-Pull Detection
 *
 * This algorithm ONLY evaluates on-chain security factors that indicate
 * whether a token could be a rug-pull. It does NOT penalize for:
 *   - Price drops / negative price change
 *   - Low market cap (small tokens can be safe)
 *   - Low volume
 *
 * Risk factors checked (inspired by rugcheck.xyz):
 *   1. Mint Authority (can they print more tokens?)
 *   2. Freeze Authority (can they freeze your wallet?)
 *   3. Update Authority (can they change the contract?)
 *   4. LP Status (burned > locked > unlocked)
 *   5. Liquidity depth (is there enough to sell?)
 *   6. Top Holder concentration (insider whale risk)
 *   7. Liq/MCap ratio (rug-pull liquidity warning)
 */
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

    // We need marketData first to get the price for the top holders
    const marketData = await externalApisService.getMarketData(address);
    const [rpcData, holders] = await Promise.all([
      solanaRpcService.getTokenAuthorities(address),
      solanaRpcService.getTopHolders(
        address,
        parseFloat(marketData.priceNative.toString()),
        parseFloat(marketData.price.toString()),
      ),
    ]);

    // 4. Calculate Risk Score — ONLY on-chain rug indicators
    let riskScore = 100;

    // Blue-Chip Safeguard: Massive established tokens (SOL, BONK, JUP, etc.)
    // with large market caps and deep liquidity are NOT standard rugpulls
    const isBlueChip =
      marketData.marketCap > 50_000_000 && marketData.liquidityUsd > 2_000_000;

    if (!isBlueChip) {
      // === AUTHORITY CHECKS (Most critical for rug detection) ===
      // Mint Authority: Can the dev print unlimited tokens and dump?
      if (rpcData.mintAuthority === "active") riskScore -= 25;

      // Freeze Authority: Can the dev freeze your wallet so you can't sell?
      if (rpcData.freezeAuthority === "active") riskScore -= 20;

      // Update Authority: Can the dev change the token contract?
      if (rpcData.updateAuthority === "active") riskScore -= 10;

      // === LP STATUS (Second most critical) ===
      // Unlocked LP = dev can pull liquidity at any time (classic rug)
      if (marketData.lpStatus === "unlocked") riskScore -= 25;
      // Locked LP = safer but can still expire
      else if (marketData.lpStatus === "locked") riskScore -= 5;
      // Burned LP = no penalty, liquidity is permanent

      // === LIQUIDITY DEPTH CHECK ===
      // Very low liquidity means even small sells cause massive slippage
      // This is NOT a price penalty — it's a "can you actually sell" check
      if (marketData.liquidityUsd < 500) riskScore -= 10;
      else if (marketData.liquidityUsd < 5000) riskScore -= 5;

      // === TOP HOLDER CONCENTRATION ===
      // High concentration = insider can dump and crash the token
      if (holders.length > 0) {
        const topHolder = holders[0];
        if (topHolder.percentage > 50) riskScore -= 15;
        else if (topHolder.percentage > 30) riskScore -= 10;
        else if (topHolder.percentage > 15) riskScore -= 5;

        // Check total concentration of top 5 holders
        const top5Total = holders
          .slice(0, 5)
          .reduce((sum, h) => sum + h.percentage, 0);
        if (top5Total > 80) riskScore -= 10;
        else if (top5Total > 60) riskScore -= 5;
      }

      // === LIQ/MCAP RATIO ===
      // Very low ratio means liquidity is thin relative to market cap
      // This is a structural vulnerability, not a price indicator
      if (marketData.liqMcapRatio < 0.5 && marketData.marketCap > 0)
        riskScore -= 5;
    } else {
      // Blue chips get a guaranteed safe score
      riskScore = 100;
    }

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
      mintAuthorityAddress: rpcData.mintAuthorityAddress,
      freezeAuthority: rpcData.freezeAuthority,
      freezeAuthorityAddress: rpcData.freezeAuthorityAddress,
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
