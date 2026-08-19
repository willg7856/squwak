"use client";

import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { useNotebook } from "@/components/NotebookProvider";
import { dailyPrompt, formatDayHeading } from "@/lib/time";

export default function JournalPage() {
  const { user, journalNotes } = useNotebook();
  const prompt = dailyPrompt();
  if (!user) return null;

  const grouped = new Map<string, typeof journalNotes>();
  for (const note of journalNotes) {
    const heading = formatDayHeading(note.createdAt);
    const list = grouped.get(heading) ?? [];
    list.push(note);
    grouped.set(heading, list);
  }

  return (
    <AppShell title="Journal">
      <div className="border-b border-line bg-plum/5 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-plum">Prompt</p>
        <p className="mt-1 font-journal text-xl leading-8">{prompt}</p>
      </div>
      <Composer defaultKind="journal" prompt={prompt} />
      {journalNotes.length === 0 ? (
        <EmptyState
          title="No pages yet."
          body="Journal entries live here, dated, with a mood if you want one."
        />
      ) : (
        [...grouped.entries()].map(([heading, dayNotes]) => (
          <section key={heading}>
            <h2 className="sticky top-14 z-[1] border-b border-line bg-paper/90 px-5 py-2 text-sm font-semibold text-muted backdrop-blur">
              {heading}
            </h2>
            {dayNotes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </section>
        ))
      )}
    </AppShell>
  );
}
