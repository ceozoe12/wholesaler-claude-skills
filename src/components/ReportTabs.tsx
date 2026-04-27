"use client";

import { useState } from "react";
import type { Deal } from "@/lib/types";

const reportLabels = {
  recon: "Recon",
  comps: "Comps",
  rehab: "Rehab",
  notes: "Notes",
  creativeFinance: "Creative",
  conversationCoach: "Coach",
  dealStacker: "Stacker"
} as const;

export function ReportTabs({ deal }: { deal: Deal }) {
  const available = Object.entries(deal.reports).filter(([, value]) => Boolean(value)) as Array<
    [keyof typeof reportLabels, string]
  >;
  const [active, setActive] = useState<keyof typeof reportLabels>(available[0]?.[0] ?? "notes");
  const content = deal.reports[active] ?? "No report saved for this step yet.";

  if (!available.length) {
    return <div className="empty">No reports have been saved for this deal yet.</div>;
  }

  return (
    <>
      <div className="tabs">
        {available.map(([key]) => (
          <button
            className={active === key ? "" : "secondary"}
            key={key}
            type="button"
            onClick={() => setActive(key)}
          >
            {reportLabels[key]}
          </button>
        ))}
      </div>
      <pre className="report">{content}</pre>
    </>
  );
}
