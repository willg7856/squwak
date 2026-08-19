"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Composer } from "@/components/Composer";
import { EmptyState, NoteCard } from "@/components/NoteCard";
import { useNotebook } from "@/components/NotebookProvider";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const { user, noteById, repliesFor } = useNotebook();
  const note = noteById(id);
  const replies = repliesFor(id);
  if (!user) return null;

  return (
    <AppShell title="Thread">
      <div className="border-b border-line px-5 py-3 text-sm text-muted">
        <Link href="/home" className="hover:text-ink">
          ← Home
        </Link>
      </div>
      {!note ? (
        <EmptyState title="This page flew off." body="That note is not in your notebook." />
      ) : (
        <>
          <NoteCard note={note} showThreadLink={false} />
          <Composer replyToId={note.id} draftKey={`reply:${note.id}`} />
          {replies.length === 0 ? (
            <EmptyState title="No replies yet." body="Add a note in the margin." />
          ) : (
            replies.map((reply) => <NoteCard key={reply.id} note={reply} />)
          )}
        </>
      )}
    </AppShell>
  );
}
