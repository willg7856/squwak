import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listExploreNotes } from "@/lib/notes";
import { NoteCard } from "@/components/NoteCard";
import { BirdMark } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/home");
  const notes = listExploreNotes(null).slice(0, 5);

  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-12 lg:grid-cols-2">
      <section className="max-w-xl">
        <div className="mb-8 flex items-center gap-3">
          <BirdMark className="h-12 w-12 text-accent" />
          <span className="font-serif text-4xl">Squwak</span>
        </div>
        <h1 className="font-serif text-5xl leading-[1.1] sm:text-6xl">
          Twitter for the thoughts you meant to keep.
        </h1>
        <p className="mt-5 max-w-md text-lg leading-7 text-muted">
          Short notes in a public stream. Longer journal pages when the day needs more room.
          Follow people whose notebooks you want on your table.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="rounded-full bg-accent px-5 py-3 font-semibold text-white hover:bg-accent-2"
          >
            Start a notebook
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-line bg-white/50 px-5 py-3 font-semibold hover:border-ink/30"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted">
          Demo accounts are ready: willow, kai, mira, juniper — password{" "}
          <span className="font-medium text-ink">squwak</span>
        </p>
      </section>

      <section className="overflow-hidden rounded-3xl border border-line bg-white/40 shadow-[0_20px_60px_rgba(80,50,20,.08)]">
        <div className="border-b border-line px-5 py-3 font-serif text-lg">Live from the stream</div>
        <div>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} currentUserId={null} />
          ))}
        </div>
      </section>
    </div>
  );
}
