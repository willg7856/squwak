"use client";

import Link from "next/link";
import { BirdMark } from "@/components/Icons";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BirdMark className="h-12 w-12 text-accent" />
          <span className="font-serif text-4xl">Squwak</span>
        </div>
        <ThemeToggle />
      </div>
      <h1 className="font-serif text-5xl leading-[1.1] sm:text-6xl">
        A private stream for the thoughts you meant to keep.
      </h1>
      <p className="mt-5 max-w-md text-lg leading-7 text-muted">
        Short notes when the day is small. Longer journal pages when it needs more room. Nobody
        else is in this notebook.
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
          className="rounded-full border border-line bg-paper-2 px-5 py-3 font-semibold hover:border-ink/30"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
