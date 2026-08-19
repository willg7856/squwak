"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { useNotebook } from "@/components/NotebookProvider";

function HomeBody() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const tab = view === "notes" || view === "journal" ? view : "all";
  const { user, notes, journalNotes } = useNotebook();
  if (!user) return null;

  const shortNotes = notes.filter((note) => note.kind === "note");
  const items = tab === "notes" ? shortNotes : tab === "journal" ? journalNotes : notes;
  const empty =
    tab === "notes"
      ? {
          title: "No short notes yet.",
          body: "Squwak something small. Longer pages live under Journal.",
        }
      : tab === "journal"
        ? {
            title: "No journal pages yet.",
            body: "Write a longer page when the day needs more room.",
          }
        : {
            title: "Your notebook is empty.",
            body: "Write the first note of the day. Only you will see it.",
          };

  return (
    <AppShell
      title="Home"
      headerNav={[
        { href: "/home", label: "Home", active: tab === "all" },
        { href: "/home?view=notes", label: "Notes", active: tab === "notes" },
        { href: "/home?view=journal", label: "Journal", active: tab === "journal" },
      ]}
    >
      <Composer key={tab} defaultKind={tab === "journal" ? "journal" : "note"} />
      {items.length === 0 ? (
        <EmptyState title={empty.title} body={empty.body} />
      ) : (
        items.map((note) => <NoteCard key={note.id} note={note} />)
      )}
    </AppShell>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeBody />
    </Suspense>
  );
}
