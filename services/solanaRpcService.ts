import { Connection, PublicKey } from "@solana/web3.js";

// Real Solana RPC implementation for token authorities
// Uses Solana public mainnet RPC, or Alchemy if env is set
const rpcUrl =
  process.env.ALCHEMY_RPC_URL || "https://api.mainnet-beta.solana.com";
const connection = new Connection(rpcUrl, "confirmed");

export const solanaRpcService = {
  async getTokenAuthorities(address: string): Promise<{
    mintAuthority: "revoked" | "active";
    freezeAuthority: "revoked" | "active";
    updateAuthority: "revoked" | "active";
    mintAuthorityAddress: string | null;
    freezeAuthorityAddress: string | null;
    decimals: number;
    totalSupply: number;
  }> {
    try {
      const pubkey = new PublicKey(address);
      const accountInfo = await connection.getParsedAccountInfo(pubkey);

      if (accountInfo.value?.data && "parsed" in accountInfo.value.data) {
        const info = accountInfo.value.data.parsed.info;
        const decimals = info.decimals ?? 9;
        const rawSupply = info.supply ?? "0";
        const totalSupply = parseInt(rawSupply) / Math.pow(10, decimals);

        return {
          mintAuthority:
            info.mintAuthority === null ||
            info.mintAuthority === "11111111111111111111111111111111"
              ? "revoked"
              : "active",
          freezeAuthority:
            info.freezeAuthority === null ||
            info.freezeAuthority === "11111111111111111111111111111111"
              ? "revoked"
              : "active",
          // Update Authority: Derive from whether the token is mutable
          // If mint authority is still active, the contract is effectively updatable
          updateAuthority: info.mintAuthority === null ? "revoked" : "active",
          mintAuthorityAddress: info.mintAuthority || null,
          freezeAuthorityAddress: info.freezeAuthority || null,
          decimals,
          totalSupply,
        };
      }

      throw new Error("Invalid account data");
    } catch (error) {
      console.error("Solana RPC error:", error);
      // Fallback to unknown state
      return {
        mintAuthority: "active",
        freezeAuthority: "active",
        updateAuthority: "active",
        mintAuthorityAddress: null,
        freezeAuthorityAddress: null,
        decimals: 9,
        totalSupply: 0,
      };
    }
  },

  async getTopHolders(address: string) {
    try {
      const pubkey = new PublicKey(address);
      const largestAccounts = await connection.getTokenLargestAccounts(pubkey);

      if (largestAccounts.value && Array.isArray(largestAccounts.value)) {
        const accounts = largestAccounts.value.slice(0, 20);
        const supplyInfo = await connection.getTokenSupply(pubkey);
        const totalAmount = supplyInfo.value.uiAmount || 1;

        return accounts.map((account, index: number) => {
          const quantity = account.uiAmount || 0;
          const percentage =
            totalAmount > 0
              ? parseFloat(((quantity / totalAmount) * 100).toFixed(2))
              : 0;

          return {
            rank: index + 1,
            address: `${account.address.toString().slice(0, 4)}...${account.address.toString().slice(-4)}`,
            rawAddress: account.address.toString(),
            quantity,
            percentage,
            tag: percentage > 20 ? "WHALE ALERT" : undefined,
          };
        });
      }

      throw new Error("Could not fetch top holders or supply from Solana RPC.");
    } catch (error) {
      console.warn(
        "RPC Rate Limited or Failed: Returning empty holders list.",
        error,
      );
      // Return empty array instead of fake data so we never lie to the user
      return [];
    }
  },
};
