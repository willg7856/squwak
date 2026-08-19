"use client";

import { contributionWeeks, heatLevel, parseDayKey } from "@/lib/time";

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ActivityHeatmap({ counts }: { counts: Record<string, number> }) {
  const weeks = contributionWeeks(counts);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const monthLabels = weeks.map((week, index) => {
    const sunday = week[0];
    if (!sunday) return "";
    const month = parseDayKey(sunday.date).getMonth();
    const prev = weeks[index - 1]?.[0];
    if (prev && parseDayKey(prev.date).getMonth() === month) return "";
    if (index === weeks.length - 1) return "";
    return parseDayKey(sunday.date).toLocaleDateString(undefined, { month: "short" });
  });

  return (
    <section className="border-b border-line px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg text-ink">Writing activity</h2>
        <p className="text-xs text-muted">
          {total} {total === 1 ? "entry" : "entries"} in the last year
        </p>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex">
          <div className="mr-1 flex w-7 shrink-0 flex-col pt-4">
            {WEEKDAY_LABELS.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="h-[11px] text-[9px] leading-[11px] text-muted"
                style={{ marginBottom: index === 6 ? 0 : 3 }}
              >
                {label}
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1 flex gap-[3px]">
              {monthLabels.map((label, index) => (
                <div
                  key={weeks[index]?.[0]?.date ?? index}
                  className="relative h-3 w-[11px] shrink-0 text-[9px] leading-none text-muted"
                >
                  {label ? <span className="absolute left-0 whitespace-nowrap">{label}</span> : null}
                </div>
              ))}
            </div>
            <div className="inline-flex gap-[3px]">
              {weeks.map((week) => (
                <div key={week[0]?.date} className="flex flex-col gap-[3px]">
                  {week.map((cell) => (
                    <div
                      key={cell.date}
                      title={
                        cell.future
                          ? ""
                          : `${parseDayKey(cell.date).toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}: ${cell.count} ${cell.count === 1 ? "entry" : "entries"}`
                      }
                      className={`h-[11px] w-[11px] rounded-[2px] ${
                        cell.future ? "bg-transparent" : `heat-${heatLevel(cell.count)}`
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
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
