import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VisitorStats = {
  total: number;
  today: number;
};

export async function GET(request: Request) {
  try {
    const { incrementVisitorCount, getVisitorStats } = await import("@/lib/db");
    const { searchParams } = new URL(request.url);
    const hit = searchParams.get("hit") === "true";
    
    let stats: VisitorStats;
    if (hit) {
      stats = incrementVisitorCount();
    } else {
      stats = getVisitorStats();
    }
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Visitor API Error:", error);
    return NextResponse.json({ total: 0, today: 0 }, { status: 500 });
  }
}
