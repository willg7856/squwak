import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { SearchBox } from "@/components/SearchBox";
import { getCurrentUser } from "@/lib/auth";
import { listExploreNotes } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await getCurrentUser();
  const { q } = await searchParams;
  const notes = listExploreNotes(user?.id ?? null, q);

  return (
    <AppShell user={user} title="Explore">
      <Suspense>
        <SearchBox initialQuery={q} />
      </Suspense>
      {q && (
        <div className="border-b border-line px-5 py-3 text-sm text-muted">
          Results for <span className="font-semibold text-ink">{q}</span>
        </div>
      )}
      {notes.length === 0 ? (
        <EmptyState
          title="Nothing in the margins."
          body="Try another word, or browse the public stream without a query."
        />
      ) : (
        notes.map((note) => (
          <NoteCard key={note.id} note={note} currentUserId={user?.id ?? null} />
        ))
      )}
    </AppShell>
  );
}
