import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { getCurrentUser } from "@/lib/auth";
import { getNote, listReplies } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const note = getNote(id, user?.id ?? null);
  if (!note) notFound();
  const replies = listReplies(id, user?.id ?? null);

  return (
    <AppShell user={user} title="Thread">
      <div className="border-b border-line px-5 py-3 text-sm text-muted">
        <Link href="/home" className="hover:text-ink">
          ← Home
        </Link>
      </div>
      <NoteCard note={note} currentUserId={user?.id ?? null} showThreadLink={false} />
      {user && (
        <Composer
          displayName={user.displayName}
          avatarHue={user.avatarHue}
          replyToId={note.id}
        />
      )}
      {replies.length === 0 ? (
        <EmptyState title="No replies yet." body="Be the first note in the margin." />
      ) : (
        replies.map((reply) => (
          <NoteCard key={reply.id} note={reply} currentUserId={user?.id ?? null} />
        ))
      )}
    </AppShell>
  );
}
