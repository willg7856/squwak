"use client";

import { AppShell } from "@/components/AppShell";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { useNotebook } from "@/components/NotebookProvider";

export default function BookmarksPage() {
  const { user, savedNotes } = useNotebook();
  if (!user) return null;

  return (
    <AppShell title="Saved">
      {savedNotes.length === 0 ? (
        <EmptyState
          title="Nothing saved yet."
          body="Bookmark one of your notes and it will wait for you here."
        />
      ) : (
        savedNotes.map((note) => <NoteCard key={note.id} note={note} />)
      )}
    </AppShell>
  );
}
