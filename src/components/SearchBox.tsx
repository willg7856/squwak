"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(initialQuery || params.get("q") || "");

  return (
    <form
      className="border-b border-line px-4 py-3"
      onSubmit={(event) => {
        event.preventDefault();
        const next = value.trim();
        router.push(next ? `/explore?q=${encodeURIComponent(next)}` : "/explore");
      }}
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search notes, tags, people"
        className="w-full rounded-full bg-paper-2 px-4 py-2.5 outline-none placeholder:text-muted"
      />
    </form>
  );
}
