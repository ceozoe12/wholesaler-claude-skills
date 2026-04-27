import type { Deal, SourceKind, WorkflowStep } from "./types";

function stepStatus(hasFile: boolean, missingPrereq = false): WorkflowStep["status"] {
  if (hasFile) return "complete";
  if (missingPrereq) return "blocked";
  return "ready";
}

export function buildWorkflow(deal: Pick<Deal, "files">): WorkflowStep[] {
  const hasRecon = deal.files.recon;
  const hasComps = deal.files.comps;
  const hasRehab = deal.files.rehab;

  return [
    {
      key: "source-scout",
      label: "Source Scout",
      status: "optional",
      description: "Find candidate leads and save them as deals before deep recon.",
      nextAction: "Run guided searches for distressed, stale, or investor-friendly leads.",
      sourceKinds: ["api-search", "browser-capture", "manual-input"]
    },
    {
      key: "property-recon",
      label: "Property Recon",
      status: stepStatus(hasRecon),
      description: "Owner, parcel, taxes, public records, baseline value, and motivation signals.",
      nextAction: hasRecon ? "Refresh stale public data when needed." : "Start with public records and listing data.",
      sourceKinds: ["public-records", "api-search", "browser-capture", "propstream"]
    },
    {
      key: "assessor-browser",
      label: "Assessor Browser",
      status: stepStatus(hasRecon),
      description: "Locality-specific browser workflow for assessor and tax portals.",
      nextAction: "Open the correct Hampton Roads portal and capture evidence.",
      sourceKinds: ["public-records", "browser-capture"]
    },
    {
      key: "comp-analyzer",
      label: "Comp Analyzer",
      status: stepStatus(hasComps, !hasRecon),
      description: "Comps, ARV, confidence, and 70% rule offer ranges.",
      nextAction: hasComps ? "Verify thin comps before offer." : "Pull recent public comps and listing evidence.",
      sourceKinds: ["api-search", "browser-capture", "public-records"]
    },
    {
      key: "rehab-estimator",
      label: "Rehab Estimator",
      status: stepStatus(hasRehab, !hasRecon),
      description: "Photo-based repair estimate with rental, flip, and worst-case scenarios.",
      nextAction: hasRehab ? "Update with walkthrough photos." : "Attach listing or local photos.",
      sourceKinds: ["browser-capture", "manual-input"]
    },
    {
      key: "creative-finance",
      label: "Creative Finance",
      status: deal.files.creativeFinance ? "complete" : "optional",
      description: "Sub-to, seller finance, wrap, and lease-option structures when cash does not work.",
      nextAction: "Use mortgage/rent details when available.",
      sourceKinds: ["manual-input", "propstream", "api-search"]
    },
    {
      key: "conversation-coach",
      label: "Conversation Coach",
      status: deal.files.conversationCoach ? "complete" : "optional",
      description: "Seller script, objection handling, and follow-up plan based on deal signals.",
      nextAction: "Generate when you have owner context or a call scheduled.",
      sourceKinds: ["markdown-memory", "manual-input"]
    },
    {
      key: "deal-stacker",
      label: "Deal Stacker",
      status: deal.files.dealStacker ? "complete" : "ready",
      description: "Rank against the rest of the pipeline and pick the next action.",
      nextAction: "Score spread, motivation, certainty, speed, and effort.",
      sourceKinds: ["markdown-memory", "api-search"]
    }
  ];
}

export function sourceKindLabel(kind: SourceKind) {
  return {
    "public-records": "Public records",
    "api-search": "API/search",
    "browser-capture": "Browser capture",
    propstream: "PropStream",
    "manual-input": "Manual input",
    "markdown-memory": "Markdown memory"
  }[kind];
}
