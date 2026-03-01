import { Connection, PublicKey } from "@solana/web3.js";

const rpcUrl =
  process.env.ALCHEMY_RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(rpcUrl, "confirmed");

export interface PortfolioToken {
  mint: string;
  name: string;
  symbol: string;
  logoUrl: string | null;
  balance: number;
  decimals: number;
  priceUsd: number;
  valueUsd: number;
  priceChange24h: number;
  riskScore: number | null;
}

export interface WalletPortfolio {
  wallet: string;
  solBalance: number;
  solValueUsd: number;
  totalValueUsd: number;
  tokens: PortfolioToken[];
}

// Batch fetch token prices from DexScreener
async function fetchTokenPrices(
  mints: string[],
): Promise<
  Map<
    string,
    {
      name: string;
      symbol: string;
      logoUrl: string | null;
      priceUsd: number;
      priceChange24h: number;
    }
  >
> {
  const priceMap = new Map();
  if (mints.length === 0) return priceMap;

  // DexScreener allows up to 30 addresses per request
  const batches: string[][] = [];
  for (let i = 0; i < mints.length; i += 30) {
    batches.push(mints.slice(i, i + 30));
  }

  for (const batch of batches) {
    try {
      const res = await fetch(
        `https://api.dexscreener.com/tokens/v1/solana/${batch.join(",")}`,
        { next: { revalidate: 30 } },
      );
      if (res.ok) {
        const data = await res.json();
        const pairs = Array.isArray(data) ? data : [];

        for (const pair of pairs) {
          const mint = pair.baseToken?.address;
          if (mint && !priceMap.has(mint)) {
            priceMap.set(mint, {
              name: pair.baseToken?.name || "Unknown",
              symbol: pair.baseToken?.symbol || "???",
              logoUrl: pair.info?.imageUrl || null,
              priceUsd: parseFloat(pair.priceUsd) || 0,
              priceChange24h: pair.priceChange?.h24 || 0,
            });
          }
        }
      }
    } catch (err) {
      console.warn("DexScreener batch fetch error:", err);
    }
  }

  return priceMap;
}

// Fetch SOL price
async function getSolPrice(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.dexscreener.com/tokens/v1/solana/So11111111111111111111111111111111111111112",
      { next: { revalidate: 30 } },
    );
    if (res.ok) {
      const data = await res.json();
      const pairs = Array.isArray(data) ? data : [];
      if (pairs.length > 0) {
        return parseFloat(pairs[0].priceUsd) || 0;
      }
    }
  } catch {
    // fallback
  }
  return 0;
}

// Quick risk score from DexScreener data (simplified version of full analysis)
function quickRiskScore(tokenData: {
  priceUsd: number;
  priceChange24h: number;
}): number | null {
  // We can't do a full risk analysis without on-chain data, so return null
  // The portfolio page will show "N/A" and provide a link to do full rug check
  return null;
}

export async function getWalletPortfolio(
  walletAddress: string,
): Promise<WalletPortfolio> {
  const walletPubkey = new PublicKey(walletAddress);

  // Fetch SOL balance and token accounts in parallel
  const [solBalanceLamports, tokenAccounts, solPrice] = await Promise.all([
    connection.getBalance(walletPubkey),
    connection.getParsedTokenAccountsByOwner(walletPubkey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    }),
    getSolPrice(),
  ]);

  const solBalance = solBalanceLamports / 1e9;
  const solValueUsd = solBalance * solPrice;

  // Extract token mints with non-zero balances
  const tokenData: {
    mint: string;
    balance: number;
    decimals: number;
  }[] = [];

  for (const account of tokenAccounts.value) {
    const info = account.account.data.parsed?.info;
    if (!info) continue;
    const mint = info.mint;
    const amount = info.tokenAmount;
    if (!amount || parseFloat(amount.uiAmountString || "0") === 0) continue;

    tokenData.push({
      mint,
      balance: amount.uiAmount || 0,
      decimals: amount.decimals || 0,
    });
  }

  // Fetch prices for all tokens
  const mints = tokenData.map((t) => t.mint);
  const priceData = await fetchTokenPrices(mints);

  // Build portfolio tokens
  const tokens: PortfolioToken[] = tokenData
    .map((t) => {
      const price = priceData.get(t.mint);
      return {
        mint: t.mint,
        name: price?.name || "Unknown Token",
        symbol: price?.symbol || "???",
        logoUrl: price?.logoUrl || null,
        balance: t.balance,
        decimals: t.decimals,
        priceUsd: price?.priceUsd || 0,
        valueUsd: t.balance * (price?.priceUsd || 0),
        priceChange24h: price?.priceChange24h || 0,
        riskScore: price ? quickRiskScore(price) : null,
      };
    })
    // Sort by USD value descending
    .sort((a, b) => b.valueUsd - a.valueUsd);

  const totalValueUsd =
    solValueUsd + tokens.reduce((sum, t) => sum + t.valueUsd, 0);

  return {
    wallet: walletAddress,
    solBalance,
    solValueUsd,
    totalValueUsd,
    tokens,
  };
}
