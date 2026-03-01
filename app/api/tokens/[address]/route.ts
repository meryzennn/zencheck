import { NextResponse } from "next/server";
import { tokenAnalysisService } from "../../../../services/tokenAnalysis";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> },
) {
  try {
    const address = (await params).address;

    // In a real app, you would extract IP from request headers (x-forwarded-for or x-real-ip)
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    const analysis = await tokenAnalysisService.analyzeToken(address, ip);

    if (!analysis) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
