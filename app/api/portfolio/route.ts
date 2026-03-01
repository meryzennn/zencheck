import { NextRequest, NextResponse } from "next/server";
import { getWalletPortfolio } from "@/services/portfolioService";
import { PublicKey } from "@solana/web3.js";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json(
      { error: "Missing wallet address" },
      { status: 400 },
    );
  }

  // Validate the address
  try {
    new PublicKey(wallet);
  } catch {
    return NextResponse.json(
      { error: "Invalid Solana wallet address" },
      { status: 400 },
    );
  }

  try {
    const portfolio = await getWalletPortfolio(wallet);
    return NextResponse.json(portfolio, {
      headers: {
        "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 },
    );
  }
}
