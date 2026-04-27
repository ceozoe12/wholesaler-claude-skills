import { promises as fs } from "fs";
import path from "path";
import { slugifyAddress, titleCaseFromSlug } from "./slug";
import type { Deal, DealStatus, LocalityConfig, ResearchFinding } from "./types";
import { buildWorkflow } from "./workflow";

export const repoRoot = process.cwd();
export const dealsRoot = path.join(repoRoot, "deals");

type PipelineRow = {
  address: string;
  zip: string;
  motivation: string;
  maoRange: string;
  status: string;
  lastUpdated: string;
  notes: string;
};

export function parsePipelineMarkdown(markdown: string): PipelineRow[] {
  const lines = markdown.split(/\r?\n/);
  return lines
    .filter((line) => line.trim().startsWith("|") && !line.includes("---") && !line.includes("Address | ZIP"))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 7)
    .map(([address, zip, motivation, maoRange, status, lastUpdated, notes]) => ({
      address,
      zip,
      motivation,
      maoRange,
      status,
      lastUpdated,
      notes
    }));
}

export function normalizeStatus(status: string): DealStatus {
  const lower = status.toLowerCase();
  if (lower.includes("full chain")) return "Full chain complete";
  if (lower.includes("rehab")) return "Rehab done";
  if (lower.includes("comp")) return "Comps done";
  if (lower.includes("recon")) return "Recon done";
  if (lower.includes("offer")) return "Offer sent";
  if (lower.includes("contract")) return "Under contract";
  if (lower.includes("closed")) return "Closed";
  if (lower.includes("dead")) return "Dead";
  if (lower.includes("candidate")) return "Candidate";
  return "Unknown";
}

export async function readIfExists(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function cityStateFromAddress(address: string) {
  const parts = address.split(",").map((part) => part.trim());
  if (parts.length >= 2) {
    const city = parts[parts.length - 2];
    const stateZip = parts[parts.length - 1];
    const state = stateZip.split(/\s+/)[0];
    return { city, state };
  }

  const match = address.match(/,\s*([^,]+)\s+([A-Z]{2})\b/);
  if (match) return { city: match[1].trim(), state: match[2] };
  return {};
}

function findingsFromRow(row: PipelineRow): ResearchFinding[] {
  const findings: ResearchFinding[] = [
    {
      label: "Motivation",
      value: row.motivation || "Unknown",
      source: "markdown-memory",
      confidence: row.motivation ? "medium" : "unknown"
    },
    {
      label: "MAO range",
      value: row.maoRange || "Unknown",
      source: "markdown-memory",
      confidence: row.maoRange ? "medium" : "unknown"
    },
    {
      label: "Pipeline status",
      value: row.status || "Unknown",
      source: "markdown-memory",
      confidence: "high"
    }
  ];

  return findings;
}

export async function getDeal(row: PipelineRow): Promise<Deal> {
  const slug = slugifyAddress(row.address);
  const dealDir = path.join(dealsRoot, slug);
  const reports = {
    recon: await readIfExists(path.join(dealDir, "recon.md")),
    comps: await readIfExists(path.join(dealDir, "comps.md")),
    rehab: await readIfExists(path.join(dealDir, "rehab.md")),
    notes: await readIfExists(path.join(dealDir, "notes.md")),
    creativeFinance: await readIfExists(path.join(dealDir, "creative-finance.md")),
    conversationCoach: await readIfExists(path.join(dealDir, "conversation-coach.md")),
    dealStacker: await readIfExists(path.join(dealDir, "deal-stacker.md"))
  };
  const files = {
    recon: Boolean(reports.recon),
    comps: Boolean(reports.comps),
    rehab: Boolean(reports.rehab),
    notes: Boolean(reports.notes),
    creativeFinance: Boolean(reports.creativeFinance),
    conversationCoach: Boolean(reports.conversationCoach),
    dealStacker: Boolean(reports.dealStacker)
  };

  const dealBase = {
    slug,
    address: row.address,
    zip: row.zip,
    motivation: row.motivation,
    maoRange: row.maoRange,
    status: normalizeStatus(row.status),
    rawStatus: row.status,
    lastUpdated: row.lastUpdated,
    notes: row.notes,
    ...cityStateFromAddress(row.address),
    files,
    reports,
    sources: [
      {
        label: "Deal memory",
        kind: "markdown-memory" as const,
        freshness: row.lastUpdated ? `Updated ${row.lastUpdated}` : "Unknown",
        confidence: "high" as const
      }
    ],
    workflow: [],
    findings: findingsFromRow(row)
  };

  return {
    ...dealBase,
    workflow: buildWorkflow(dealBase)
  };
}

export async function getDeals(): Promise<Deal[]> {
  const pipeline = await readIfExists(path.join(dealsRoot, "pipeline.md"));
  if (!pipeline) return [];
  const rows = parsePipelineMarkdown(pipeline);
  const deals = await Promise.all(rows.map(getDeal));
  return deals.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
}

export async function getDealBySlug(slug: string) {
  const deals = await getDeals();
  const found = deals.find((deal) => deal.slug === slug);
  if (found) return found;

  const dealDir = path.join(dealsRoot, slug);
  if (!(await fileExists(dealDir))) return undefined;

  return getDeal({
    address: titleCaseFromSlug(slug),
    zip: "",
    motivation: "",
    maoRange: "",
    status: "Candidate",
    lastUpdated: "",
    notes: "Created outside pipeline registry."
  });
}

export async function getLocalityConfigs(): Promise<LocalityConfig[]> {
  const dir = path.join(dealsRoot, "county-configs");
  const files = await fs.readdir(dir);
  const configs = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => JSON.parse(await fs.readFile(path.join(dir, file), "utf8")) as LocalityConfig)
  );
  return configs.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createDealFromIntake(input: {
  address: string;
  locality?: string;
  notes?: string;
}) {
  const now = new Date().toISOString().slice(0, 10);
  const slug = slugifyAddress(input.address);
  const dealDir = path.join(dealsRoot, slug);
  await fs.mkdir(dealDir, { recursive: true });

  const notesPath = path.join(dealDir, "notes.md");
  const initialNotes = `# Notes\n\n- [${now}] Intake created from dashboard.\n- Address: ${input.address}\n${input.locality ? `- Locality: ${input.locality}\n` : ""}${input.notes ? `- Notes: ${input.notes}\n` : ""}`;
  if (!(await fileExists(notesPath))) {
    await fs.writeFile(notesPath, initialNotes, "utf8");
  }

  const pipelinePath = path.join(dealsRoot, "pipeline.md");
  const pipeline = (await readIfExists(pipelinePath)) ?? "# Deal Pipeline\n\n## Active Deals\n\n| Address | ZIP | Motivation | MAO Range | Status | Last Updated | Notes |\n|---------|-----|-----------|-----------|--------|-------------|-------|\n\n## Closed Deals\n\n| Address | Bought | Sold/Assigned | Profit | Notes |\n|---------|--------|--------------|--------|-------|\n";
  if (!pipeline.toLowerCase().includes(input.address.toLowerCase())) {
    const zipMatch = input.address.match(/\b\d{5}\b/);
    const row = `| ${input.address} | ${zipMatch?.[0] ?? ""} | unknown | unknown | Candidate | ${now} | ${input.locality ? `${input.locality} lead. ` : ""}Needs recon. |`;
    const updated = pipeline.replace(/(\n## Closed Deals)/, `\n${row}\n$1`);
    await fs.writeFile(pipelinePath, updated, "utf8");
  }

  return getDealBySlug(slug);
}

export async function appendNote(slug: string, note: string) {
  const dealDir = path.join(dealsRoot, slug);
  await fs.mkdir(dealDir, { recursive: true });
  const now = new Date().toISOString().slice(0, 10);
  const notesPath = path.join(dealDir, "notes.md");
  const existing = (await readIfExists(notesPath)) ?? "# Notes\n";
  const entry = `\n- [${now}] ${note.trim()}\n`;
  await fs.writeFile(notesPath, existing.trimEnd() + entry, "utf8");
  return readIfExists(notesPath);
}
