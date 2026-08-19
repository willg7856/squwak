"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { JournalCalendar } from "@/components/JournalCalendar";
import { useNotebook } from "@/components/NotebookProvider";
import { dailyPrompt, dayKey } from "@/lib/time";

export default function JournalPage() {
  const { user, journalNotes } = useNotebook();
  const prompt = dailyPrompt();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const dates = useMemo(
    () => new Set(journalNotes.map((note) => dayKey(note.createdAt))),
    [journalNotes],
  );
  if (!user) return null;
  const visible = selectedDay
    ? journalNotes.filter((note) => dayKey(note.createdAt) === selectedDay)
    : journalNotes;

  const grouped = new Map<string, typeof visible>();
  for (const note of visible) {
    const heading = selectedDay ?? dayKey(note.createdAt);
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
      <Composer defaultKind="journal" prompt={prompt} draftKey="journal" />
      <JournalCalendar dates={dates} selected={selectedDay} onSelect={setSelectedDay} />
      {visible.length === 0 ? (
        <EmptyState
          title={selectedDay ? "Nothing on this day." : "No pages yet."}
          body={prompt}
          href="/journal"
          action="Write from today’s prompt →"
        />
      ) : (
        [...grouped.entries()].map(([heading, dayNotes]) => (
          <section key={heading}>
            <h2 className="sticky top-14 z-[1] border-b border-line bg-paper/90 px-5 py-2 text-sm font-semibold text-muted backdrop-blur">
              {dayNotes[0] ? new Date(dayNotes[0].createdAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) : heading}
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
