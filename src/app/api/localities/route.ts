import { NextResponse } from "next/server";
import { getLocalityConfigs } from "@/lib/deal-memory";

export async function GET() {
  const localities = await getLocalityConfigs();
  return NextResponse.json({ localities });
}
