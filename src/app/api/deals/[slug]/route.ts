import { NextResponse } from "next/server";
import { getDealBySlug } from "@/lib/deal-memory";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const deal = await getDealBySlug(slug);
  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }
  return NextResponse.json({ deal });
}
