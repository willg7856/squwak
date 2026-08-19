import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { getCurrentUser } from "@/lib/auth";
import { listJournalNotes } from "@/lib/notes";
import { dailyPrompt, formatDayHeading } from "@/lib/time";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const notes = listJournalNotes(user.id, user.id);
  const prompt = dailyPrompt();

  const grouped = new Map<string, typeof notes>();
  for (const note of notes) {
    const heading = formatDayHeading(note.createdAt);
    const list = grouped.get(heading) ?? [];
    list.push(note);
    grouped.set(heading, list);
  }

  return (
    <AppShell user={user} title="Journal">
      <div className="border-b border-line bg-plum/5 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-plum">Prompt</p>
        <p className="mt-1 font-journal text-xl leading-8">{prompt}</p>
      </div>
      <Composer
        displayName={user.displayName}
        avatarHue={user.avatarHue}
        defaultKind="journal"
        prompt={prompt}
      />
      {notes.length === 0 ? (
        <EmptyState
          title="No pages yet."
          body="Journal entries can be private or public. They live here, dated, with a mood if you want one."
        />
      ) : (
        [...grouped.entries()].map(([heading, dayNotes]) => (
          <section key={heading}>
            <h2 className="sticky top-14 z-[1] border-b border-line bg-paper/90 px-5 py-2 text-sm font-semibold text-muted backdrop-blur">
              {heading}
            </h2>
            {dayNotes.map((note) => (
              <NoteCard key={note.id} note={note} currentUserId={user.id} />
            ))}
          </section>
        ))
      )}
    </AppShell>
  );
}
