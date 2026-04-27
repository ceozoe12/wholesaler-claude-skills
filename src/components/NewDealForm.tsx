"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewDealForm({ localities }: { localities: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/deals/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: form.get("address"),
        locality: form.get("locality"),
        notes: form.get("notes")
      })
    });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not create deal.");
      return;
    }
    router.push(`/deals/${payload.deal.slug}`);
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Property address
        <input name="address" placeholder="123 Example St, Norfolk, VA 23504" required />
      </label>
      <label>
        Locality
        <select name="locality" defaultValue="">
          <option value="">Detect from address later</option>
          {localities.map((locality) => (
            <option key={locality} value={locality}>{locality}</option>
          ))}
        </select>
      </label>
      <label>
        Notes
        <textarea name="notes" placeholder="Lead source, owner situation, drive-by notes, asking price, or anything you already know." />
      </label>
      {error ? <p className="chip hot">{error}</p> : null}
      <button type="submit" disabled={busy}>{busy ? "Creating..." : "Create Deal"}</button>
    </form>
  );
}
