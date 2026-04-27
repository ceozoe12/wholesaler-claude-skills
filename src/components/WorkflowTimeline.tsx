import type { Deal, WorkflowStepKey } from "@/lib/types";
import { sourceKindLabel } from "@/lib/workflow";

async function runStep(formData: FormData) {
  "use server";
  const slug = String(formData.get("slug"));
  const step = String(formData.get("step")) as WorkflowStepKey;
  const { appendNote } = await import("@/lib/deal-memory");
  await appendNote(
    slug,
    `Workflow queued from dashboard: ${step}. Use Codex browser/API workflow and save evidence to the matching report.`
  );
}

export function WorkflowTimeline({ deal }: { deal: Deal }) {
  return (
    <div className="timeline">
      {deal.workflow.map((step) => (
        <div className="step" key={step.key}>
          <span className={`status ${step.status}`}>{step.status}</span>
          <div>
            <h3>{step.label}</h3>
            <p>{step.description}</p>
            <div className="chip-row">
              {step.sourceKinds.map((kind) => (
                <span className="chip" key={kind}>{sourceKindLabel(kind)}</span>
              ))}
            </div>
            <p className="subcopy">{step.nextAction}</p>
            <form action={runStep}>
              <input type="hidden" name="slug" value={deal.slug} />
              <input type="hidden" name="step" value={step.key} />
              <button className="secondary" type="submit">Queue Step</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
