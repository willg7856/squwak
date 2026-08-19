"use client";

import { contributionWeeks, heatLevel, parseDayKey } from "@/lib/time";

export function ActivityHeatmap({ counts }: { counts: Record<string, number> }) {
  const weeks = contributionWeeks(counts);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  return (
    <section className="border-b border-line px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg text-ink">Writing activity</h2>
        <p className="text-xs text-muted">{total} {total === 1 ? "entry" : "entries"} this year</p>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-[3px]">
          {weeks.map((week) => (
            <div key={week[0]?.date} className="flex flex-col gap-[3px]">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  title={
                    cell.future
                      ? ""
                      : `${parseDayKey(cell.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}: ${cell.count}`
                  }
                  className={`h-[11px] w-[11px] rounded-[2px] ${cell.future ? "bg-transparent" : `heat-${heatLevel(cell.count)}`}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted">
        Less
        <span className="heat-0 h-2.5 w-2.5 rounded-[2px]" />
        <span className="heat-1 h-2.5 w-2.5 rounded-[2px]" />
        <span className="heat-2 h-2.5 w-2.5 rounded-[2px]" />
        <span className="heat-3 h-2.5 w-2.5 rounded-[2px]" />
        <span className="heat-4 h-2.5 w-2.5 rounded-[2px]" />
        More
      </div>
    </section>
  );
}
