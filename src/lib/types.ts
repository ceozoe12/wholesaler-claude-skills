export type DealStatus =
  | "Recon done"
  | "Rehab done"
  | "Comps done"
  | "Offer sent"
  | "Under contract"
  | "Closed"
  | "Dead"
  | "Full chain complete"
  | "Candidate"
  | "Unknown";

export type SourceKind =
  | "public-records"
  | "api-search"
  | "browser-capture"
  | "propstream"
  | "manual-input"
  | "markdown-memory";

export type Confidence = "high" | "medium" | "low" | "unknown";

export type DataSource = {
  label: string;
  kind: SourceKind;
  url?: string;
  freshness: string;
  confidence: Confidence;
};

export type WorkflowStepKey =
  | "source-scout"
  | "property-recon"
  | "assessor-browser"
  | "comp-analyzer"
  | "rehab-estimator"
  | "creative-finance"
  | "conversation-coach"
  | "deal-stacker";

export type WorkflowStatus = "ready" | "complete" | "blocked" | "optional";

export type WorkflowStep = {
  key: WorkflowStepKey;
  label: string;
  status: WorkflowStatus;
  description: string;
  nextAction: string;
  sourceKinds: SourceKind[];
};

export type ResearchFinding = {
  label: string;
  value: string;
  source: SourceKind;
  confidence: Confidence;
};

export type AgentRun = {
  id: string;
  dealSlug: string;
  step: WorkflowStepKey;
  status: "queued" | "running" | "needs-input" | "complete";
  createdAt: string;
  message: string;
};

export type Deal = {
  slug: string;
  address: string;
  zip: string;
  motivation: string;
  maoRange: string;
  status: DealStatus;
  rawStatus: string;
  lastUpdated: string;
  notes: string;
  city?: string;
  state?: string;
  files: {
    recon: boolean;
    comps: boolean;
    rehab: boolean;
    notes: boolean;
    creativeFinance: boolean;
    conversationCoach: boolean;
    dealStacker: boolean;
  };
  reports: {
    recon?: string;
    comps?: string;
    rehab?: string;
    notes?: string;
    creativeFinance?: string;
    conversationCoach?: string;
    dealStacker?: string;
  };
  sources: DataSource[];
  workflow: WorkflowStep[];
  findings: ResearchFinding[];
};

export type LocalityConfig = {
  slug: string;
  name: string;
  state: "VA";
  region: "Hampton Roads";
  assessorUrl: string;
  propertySearchUrl: string;
  treasurerUrl?: string;
  searchModes: string[];
  sourceKinds: SourceKind[];
  codexWorkflow: string[];
  fallback: string;
  lastVerified: string;
};
