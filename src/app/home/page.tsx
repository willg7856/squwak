import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { getCurrentUser } from "@/lib/auth";
import { listHomeNotes } from "@/lib/notes";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const notes = listHomeNotes(user.id);

  return (
    <AppShell user={user} title="Home">
      <Composer displayName={user.displayName} avatarHue={user.avatarHue} />
      {notes.length === 0 ? (
        <EmptyState
          title="Your stream is quiet."
          body="Follow a few notebooks from Explore, or post the first note of the day."
        />
      ) : (
        notes.map((note) => <NoteCard key={note.id} note={note} currentUserId={user.id} />)
      )}
    </AppShell>
  );
}
