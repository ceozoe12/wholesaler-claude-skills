import { NextResponse } from "next/server";
import { appendNote, getDealBySlug } from "@/lib/deal-memory";
import type { AgentRun, WorkflowStepKey } from "@/lib/types";

const validSteps: WorkflowStepKey[] = [
  "source-scout",
  "property-recon",
  "assessor-browser",
  "comp-analyzer",
  "rehab-estimator",
  "creative-finance",
  "conversation-coach",
  "deal-stacker"
];

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const body = (await request.json()) as { step?: WorkflowStepKey };
  const deal = await getDealBySlug(slug);

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  if (!body.step || !validSteps.includes(body.step)) {
    return NextResponse.json({ error: "Valid workflow step is required" }, { status: 400 });
  }

  const run: AgentRun = {
    id: `${slug}-${body.step}-${Date.now()}`,
    dealSlug: slug,
    step: body.step,
    status: "needs-input",
    createdAt: new Date().toISOString(),
    message:
      "Guided Codex workflow queued. Open the matching skill, capture sources, and save findings back to deal memory."
  };

  await appendNote(
    slug,
    `Workflow queued: ${body.step}. ${run.message}`
  );

  return NextResponse.json({ run });
}
