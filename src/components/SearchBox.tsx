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
        const next = new URLSearchParams(params.toString());
        const q = value.trim();
        if (q) next.set("q", q);
        else next.delete("q");
        const qs = next.toString();
        router.push(qs ? `/explore?${qs}` : "/explore");
      }}
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search your notes and tags"
        className="w-full rounded-full border border-line bg-paper-2 px-4 py-2.5 text-ink outline-none placeholder:text-muted"
        id="squwak-search"
      />
    </form>
  );
}
