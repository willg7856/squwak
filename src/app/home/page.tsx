"use client";

import { AppShell } from "@/components/AppShell";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { useNotebook } from "@/components/NotebookProvider";
import { dailyPrompt } from "@/lib/time";

export default function HomePage() {
  const { user, notes, activity } = useNotebook();
  const prompt = dailyPrompt();
  if (!user) return null;

  return (
    <AppShell title="Home">
      <Composer draftKey="home" />
      <ActivityHeatmap counts={activity} />
      {notes.length === 0 ? (
        <EmptyState
          title="Your notebook is empty."
          body={prompt}
          href="/journal"
          action="Write a page →"
        />
      ) : (
        notes.map((note) => <NoteCard key={note.id} note={note} />)
      )}
    </AppShell>
  );
}
