import { NextResponse } from "next/server";
import { appendNote } from "@/lib/deal-memory";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slug?: string;
    note?: string;
  };

  if (!body.slug || !body.note?.trim()) {
    return NextResponse.json({ error: "Deal slug and note are required" }, { status: 400 });
  }

  const notes = await appendNote(body.slug, body.note);
  return NextResponse.json({ notes });
}
