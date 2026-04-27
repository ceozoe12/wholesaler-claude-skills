"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NoteForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim()) return;
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, note })
    });
    setNote("");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        Add note
        <textarea value={note} onChange={(event) => setNote(event.target.value)} />
      </label>
      <button type="submit">Save Note</button>
    </form>
  );
}
