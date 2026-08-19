import { AppShell } from "@/components/AppShell";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { getCurrentUser } from "@/lib/auth";
import { listBookmarks } from "@/lib/notes";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const notes = listBookmarks(user.id);

  return (
    <AppShell user={user} title="Saved">
      {notes.length === 0 ? (
        <EmptyState
          title="Nothing saved yet."
          body="Bookmark a note from the stream and it will wait for you here."
        />
      ) : (
        notes.map((note) => <NoteCard key={note.id} note={note} currentUserId={user.id} />)
      )}
    </AppShell>
  );
}
