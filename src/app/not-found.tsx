import Link from "next/link";
import { BirdMark } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <BirdMark className="h-12 w-12 text-accent" />
      <h1 className="mt-6 font-serif text-4xl">This page flew off.</h1>
      <p className="mt-2 max-w-sm text-muted">The note or notebook you are looking for is not here.</p>
      <Link href="/home" className="btn-accent mt-6 rounded-full px-5 py-2.5 font-semibold">
        Back to the stream
      </Link>
    </div>
  );
}
