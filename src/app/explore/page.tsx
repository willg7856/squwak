"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { SearchBox } from "@/components/SearchBox";
import { useNotebook } from "@/components/NotebookProvider";
import { MOODS, type Mood, type NoteKind, type SearchFilters } from "@/lib/types";

function ExploreBody() {
  const { search, tags } = useNotebook();
  const params = useSearchParams();
  const router = useRouter();
  const filters: SearchFilters = {
    query: params.get("q") ?? "",
    kind: (params.get("kind") as NoteKind | "all" | null) || "all",
    mood: (params.get("mood") as Mood | null) || "",
    tag: params.get("tag") ?? "",
    photos: params.get("photos") === "1",
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
  };
  const notes = search(filters);

  function setFilter(next: Partial<SearchFilters>) {
    const merged = { ...filters, ...next };
    const url = new URLSearchParams();
    if (merged.query) url.set("q", merged.query);
    if (merged.kind && merged.kind !== "all") url.set("kind", merged.kind);
    if (merged.mood) url.set("mood", merged.mood);
    if (merged.tag) url.set("tag", merged.tag);
    if (merged.photos) url.set("photos", "1");
    if (merged.from) url.set("from", merged.from);
    if (merged.to) url.set("to", merged.to);
    const qs = url.toString();
    router.push(qs ? `/explore?${qs}` : "/explore");
  }

  return (
    <AppShell title="Search">
      <SearchBox initialQuery={filters.query ?? ""} />
      <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
        <select
          value={filters.kind ?? "all"}
          onChange={(event) => setFilter({ kind: event.target.value as SearchFilters["kind"] })}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm"
        >
          <option value="all">All kinds</option>
          <option value="note">Notes</option>
          <option value="journal">Journal</option>
        </select>
        <select
          value={filters.mood ?? ""}
          onChange={(event) => setFilter({ mood: event.target.value as Mood | "" })}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm"
        >
          <option value="">Any mood</option>
          {MOODS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={filters.tag ?? ""}
          onChange={(event) => setFilter({ tag: event.target.value })}
          className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm"
        >
          <option value="">Any tag</option>
          {tags.map((item) => (
            <option key={item.tag} value={item.tag}>
              #{item.tag}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-sm">
          <input
            type="checkbox"
            checked={Boolean(filters.photos)}
            onChange={(event) => setFilter({ photos: event.target.checked })}
          />
          Photos
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-muted">
          From
          <input
            type="date"
            value={filters.from ?? ""}
            onChange={(event) => setFilter({ from: event.target.value })}
            className="rounded-lg border border-line bg-paper px-2 py-1 text-ink"
          />
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-muted">
          To
          <input
            type="date"
            value={filters.to ?? ""}
            onChange={(event) => setFilter({ to: event.target.value })}
            className="rounded-lg border border-line bg-paper px-2 py-1 text-ink"
          />
        </label>
      </div>
      {filters.query && (
        <div className="border-b border-line px-5 py-3 text-sm text-muted">
          Results for <span className="font-semibold text-ink">{filters.query}</span>
        </div>
      )}
      {notes.length === 0 ? (
        <EmptyState title="Nothing in the margins." body="Search across your own notes, tags, moods, and dates." />
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
