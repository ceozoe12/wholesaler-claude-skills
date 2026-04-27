import Link from "next/link";
import { DealCard } from "@/components/DealCard";
import { getDeals } from "@/lib/deal-memory";

export default async function DashboardPage() {
  const deals = await getDeals();
  const active = deals.filter((deal) => !["Closed", "Dead"].includes(deal.status));
  const readySteps = deals.reduce(
    (count, deal) => count + deal.workflow.filter((step) => step.status === "ready").length,
    0
  );
  const hot = deals.filter((deal) => `${deal.motivation} ${deal.notes}`.toLowerCase().includes("high")).length;
  const stale = deals.filter((deal) => {
    if (!deal.lastUpdated) return false;
    const age = Date.now() - new Date(`${deal.lastUpdated}T00:00:00`).getTime();
    return age > 1000 * 60 * 60 * 24 * 7;
  }).length;

  return (
    <section className="page">
      <div className="topline">
        <div>
          <p className="eyebrow">Codex guided acquisitions desk</p>
          <h1>Find, verify, and stack Hampton Roads deals.</h1>
        </div>
        <Link className="button" href="/new">Add Address</Link>
      </div>

      <div className="grid metrics">
        <div className="metric"><span>Active deals</span><strong>{active.length}</strong></div>
        <div className="metric"><span>Ready workflow steps</span><strong>{readySteps}</strong></div>
        <div className="metric"><span>High motivation</span><strong>{hot}</strong></div>
        <div className="metric"><span>Stale over 7 days</span><strong>{stale}</strong></div>
      </div>

      <div className="workspace" style={{ marginTop: 24 }}>
        <div className="deal-list">
          {deals.length ? deals.map((deal) => <DealCard deal={deal} key={deal.slug} />) : (
            <div className="empty">
              <h2>No deals yet</h2>
              <p>Add your first address and the app will create local deal memory.</p>
            </div>
          )}
        </div>
        <aside>
          <div className="panel">
            <p className="eyebrow">Priority action</p>
            <h2>Run guided recon on the best Hampton Roads candidate.</h2>
            <p className="subcopy">
              Start with public records, then use browser capture for city portals,
              API/search for market context, and PropStream only when logged in.
            </p>
          </div>
          <div className="panel">
            <p className="eyebrow">Source posture</p>
            <div className="chip-row">
              <span className="chip">Public records</span>
              <span className="chip">API/search</span>
              <span className="chip">Browser capture</span>
              <span className="chip">PropStream optional</span>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
