import { NextResponse } from "next/server";
import { incrementVisitorCount, getVisitorStats } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hit = searchParams.get("hit") === "true";
    
    let stats;
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
