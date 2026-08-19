"use client";

import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { useNotebook } from "@/components/NotebookProvider";

export default function NotesPage() {
  const { user, notes } = useNotebook();
  if (!user) return null;

  const shortNotes = notes.filter((note) => note.kind === "note");

  return (
    <AppShell title="Notes">
      <Composer defaultKind="note" />
      {shortNotes.length === 0 ? (
        <EmptyState
          title="No short notes yet."
          body="Squwak something small. Longer pages live under Journal."
        />
      ) : (
        shortNotes.map((note) => <NoteCard key={note.id} note={note} />)
      )}
    </AppShell>
  );
}
