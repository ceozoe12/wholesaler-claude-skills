import { NextResponse } from "next/server";
import { getDeals } from "@/lib/deal-memory";

export async function GET() {
  const deals = await getDeals();
  return NextResponse.json({ deals });
}
