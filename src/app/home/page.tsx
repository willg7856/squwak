"use client";

import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { useNotebook } from "@/components/NotebookProvider";

export default function HomePage() {
  const { user, notes } = useNotebook();
  if (!user) return null;

  return (
    <AppShell title="Home">
      <Composer />
      {notes.length === 0 ? (
        <EmptyState
          title="Your notebook is empty."
          body="Write the first note of the day. Only you will see it."
        />
      ) : (
        notes.map((note) => <NoteCard key={note.id} note={note} />)
      )}
    </AppShell>
  );
}
