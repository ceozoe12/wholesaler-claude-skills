import Link from "next/link";
import type { Deal } from "@/lib/types";

function statusClass(deal: Deal) {
  const text = `${deal.motivation} ${deal.rawStatus}`.toLowerCase();
  if (text.includes("high") || text.includes("foreclosure")) return "hot";
  if (deal.workflow.some((step) => step.status === "ready")) return "ready";
  return "";
}

export function DealCard({ deal }: { deal: Deal }) {
  const nextStep = deal.workflow.find((step) => step.status === "ready");

  return (
    <article className="deal-card">
      <div>
        <p className="eyebrow">{deal.zip || "No ZIP"} / {deal.rawStatus}</p>
        <h2>{deal.address}</h2>
        <div className="deal-meta">
          <span className={`chip ${statusClass(deal)}`}>Motivation {deal.motivation || "unknown"}</span>
          <span className="chip">MAO {deal.maoRange || "unknown"}</span>
          <span className="chip">Updated {deal.lastUpdated || "unknown"}</span>
        </div>
        <p className="subcopy">{deal.notes || "No notes yet."}</p>
        {nextStep ? (
          <span className="chip ready">Next: {nextStep.label}</span>
        ) : (
          <span className="chip">Workflow current</span>
        )}
      </div>
      <Link className="button secondary" href={`/deals/${deal.slug}`} aria-label={`Open ${deal.address}`}>
        Open
      </Link>
    </article>
  );
}
