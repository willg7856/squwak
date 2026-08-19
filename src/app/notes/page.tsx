"use client";

import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { useNotebook } from "@/components/NotebookProvider";
import { dailyPrompt } from "@/lib/time";

export default function NotesPage() {
  const { user, notes } = useNotebook();
  const prompt = dailyPrompt();
  if (!user) return null;

  const shortNotes = notes.filter((note) => note.kind === "note");

  return (
    <AppShell title="Notes">
      <Composer defaultKind="note" draftKey="notes" />
      {shortNotes.length === 0 ? (
        <EmptyState
          title="No short notes yet."
          body={prompt}
          href="/home"
          action="Write one on Home →"
        />
      ) : (
        shortNotes.map((note) => <NoteCard key={note.id} note={note} />)
      )}
    </AppShell>
  );
}
