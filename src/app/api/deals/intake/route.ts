import { NextResponse } from "next/server";
import { createDealFromIntake } from "@/lib/deal-memory";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    address?: string;
    locality?: string;
    notes?: string;
  };

  if (!body.address?.trim()) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const deal = await createDealFromIntake({
    address: body.address.trim(),
    locality: body.locality?.trim(),
    notes: body.notes?.trim()
  });

  return NextResponse.json({ deal }, { status: 201 });
}
