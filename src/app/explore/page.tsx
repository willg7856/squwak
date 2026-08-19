"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { SearchBox } from "@/components/SearchBox";
import { useNotebook } from "@/components/NotebookProvider";

function ExploreBody() {
  const { search } = useNotebook();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const notes = search(q);

  return (
    <AppShell title="Search">
      <SearchBox initialQuery={q} />
      {q && (
        <div className="border-b border-line px-5 py-3 text-sm text-muted">
          Results for <span className="font-semibold text-ink">{q}</span>
        </div>
      )}
      {notes.length === 0 ? (
        <EmptyState
          title="Nothing in the margins."
          body="Search across your own notes and tags."
        />
      ) : (
        notes.map((note) => <NoteCard key={note.id} note={note} />)
      )}
    </AppShell>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreBody />
    </Suspense>
  );
}
