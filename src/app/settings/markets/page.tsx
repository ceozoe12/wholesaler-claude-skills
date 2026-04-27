import { getLocalityConfigs } from "@/lib/deal-memory";
import { sourceKindLabel } from "@/lib/workflow";

export default async function MarketsPage() {
  const localities = await getLocalityConfigs();

  return (
    <section className="page">
      <div className="topline">
        <div>
          <p className="eyebrow">Market setup</p>
          <h1>Hampton Roads locality playbook.</h1>
        </div>
      </div>
      <div className="grid market-grid">
        {localities.map((locality) => (
          <article className="market-card" key={locality.slug}>
            <p className="eyebrow">{locality.region} / verified {locality.lastVerified}</p>
            <h2>{locality.name}</h2>
            <p>
              <a href={locality.assessorUrl} target="_blank" rel="noreferrer">Assessor</a>
              {" / "}
              <a href={locality.propertySearchUrl} target="_blank" rel="noreferrer">Property search</a>
            </p>
            <div className="chip-row">
              {locality.sourceKinds.map((kind) => (
                <span className="chip" key={kind}>{sourceKindLabel(kind)}</span>
              ))}
            </div>
            <h3>Search modes</h3>
            <ul>
              {locality.searchModes.map((mode) => <li key={mode}>{mode}</li>)}
            </ul>
            <h3>Codex workflow</h3>
            <ul>
              {locality.codexWorkflow.map((step) => <li key={step}>{step}</li>)}
            </ul>
            <p className="subcopy">{locality.fallback}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
