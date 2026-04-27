import { NewDealForm } from "@/components/NewDealForm";
import { getLocalityConfigs } from "@/lib/deal-memory";

export default async function NewDealPage() {
  const localities = await getLocalityConfigs();

  return (
    <section className="page">
      <div className="topline">
        <div>
          <p className="eyebrow">Address intake</p>
          <h1>Add a candidate deal.</h1>
        </div>
      </div>
      <p className="subcopy">
        This creates a local deal folder, appends the pipeline, and gets the guided
        Codex workflow ready without touching existing reports.
      </p>
      <div className="panel">
        <NewDealForm localities={localities.map((locality) => locality.name)} />
      </div>
    </section>
  );
}
