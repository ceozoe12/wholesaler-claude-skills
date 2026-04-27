import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteForm } from "@/components/NoteForm";
import { ReportTabs } from "@/components/ReportTabs";
import { WorkflowTimeline } from "@/components/WorkflowTimeline";
import { getDealBySlug } from "@/lib/deal-memory";
import { sourceKindLabel } from "@/lib/workflow";

export default async function DealPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const deal = await getDealBySlug(slug);
  if (!deal) notFound();

  return (
    <section className="page">
      <div className="topline">
        <div>
          <p className="eyebrow">{deal.rawStatus} / Updated {deal.lastUpdated || "unknown"}</p>
          <h1>{deal.address}</h1>
        </div>
        <Link className="button secondary" href="/">Back</Link>
      </div>

      <div className="grid metrics">
        <div className="metric"><span>Motivation</span><strong>{deal.motivation || "unknown"}</strong></div>
        <div className="metric"><span>MAO range</span><strong>{deal.maoRange || "unknown"}</strong></div>
        <div className="metric"><span>ZIP</span><strong>{deal.zip || "unknown"}</strong></div>
        <div className="metric"><span>Reports</span><strong>{Object.values(deal.files).filter(Boolean).length}</strong></div>
      </div>

      <div className="workspace" style={{ marginTop: 24 }}>
        <div>
          <div className="panel">
            <p className="eyebrow">Guided workflow</p>
            <WorkflowTimeline deal={deal} />
          </div>
          <div className="panel">
            <p className="eyebrow">Reports</p>
            <ReportTabs deal={deal} />
          </div>
        </div>
        <aside>
          <div className="panel">
            <p className="eyebrow">Evidence</p>
            {deal.sources.map((source) => (
              <p key={source.label}>
                <strong>{source.label}</strong><br />
                {sourceKindLabel(source.kind)} / {source.freshness} / {source.confidence}
              </p>
            ))}
          </div>
          <div className="panel">
            <p className="eyebrow">Findings</p>
            {deal.findings.map((finding) => (
              <p key={finding.label}>
                <strong>{finding.label}:</strong> {finding.value}<br />
                <span className="subcopy">{sourceKindLabel(finding.source)} / {finding.confidence}</span>
              </p>
            ))}
          </div>
          <div className="panel">
            <p className="eyebrow">Deal notes</p>
            <NoteForm slug={deal.slug} />
          </div>
        </aside>
      </div>
    </section>
  );
}
