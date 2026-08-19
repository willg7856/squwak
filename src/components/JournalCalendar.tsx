"use client";

import { useMemo, useState } from "react";
import { dayKey } from "@/lib/time";

export function JournalCalendar({
  dates,
  selected,
  onSelect,
}: {
  dates: Set<string>;
  selected: string | null;
  onSelect: (day: string | null) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: { key: string | null; day: number | null }[] = [];
    for (let i = 0; i < startOffset; i += 1) cells.push({ key: null, day: null });
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ key: dayKey(new Date(year, month, day).getTime()), day });
    }
    return cells;
  }, [cursor]);

  const label = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <section className="border-b border-line px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          className="rounded-full px-2 py-1 text-sm text-muted hover:bg-paper-2"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
        >
          ←
        </button>
        <h2 className="font-serif text-lg text-ink">{label}</h2>
        <button
          type="button"
          className="rounded-full px-2 py-1 text-sm text-muted hover:bg-paper-2"
          onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
        >
          →
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((item, index) => (
          <div key={`${item}-${index}`}>{item}</div>
        ))}
        {grid.map((cell, index) => {
          if (!cell.key || cell.day === null) {
            return <div key={`empty-${index}`} />;
          }
          const written = dates.has(cell.key);
          const active = selected === cell.key;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelect(active ? null : cell.key)}
              className={`h-8 rounded-full text-xs ${
                active
                  ? "bg-accent text-on-accent"
                  : written
                    ? "bg-accent/20 font-semibold text-ink"
                    : "text-muted hover:bg-paper-2"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
      {selected && (
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-accent"
          onClick={() => onSelect(null)}
        >
          Show all days
        </button>
      )}
    </section>
  );
}
