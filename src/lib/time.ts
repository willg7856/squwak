export function relativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 0) {
    return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  if (seconds < 45) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatFullDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDayHeading(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function dailyPrompt(now = Date.now()): string {
  const prompts = [
    "What stayed with you today?",
    "What did you notice that you almost missed?",
    "Name one thing you are carrying, and one thing you can set down.",
    "Where did the day feel most like you?",
    "Write the sentence you needed to hear this morning.",
    "What would a kinder narrator say about today?",
    "Capture a small scene: light, sound, weather, a person.",
    "What question is still open at the edge of the day?",
    "If this day were a page, what would you underline?",
    "What are you grateful for that is ordinary?",
  ];
  const day = Math.floor(now / 86_400_000);
  return prompts[day % prompts.length];
}

export function dayKey(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDayKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function endOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

export function toDateTimeLocal(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function fromDateTimeLocal(value: string): number {
  const parsed = new Date(value);
  const time = parsed.getTime();
  return Number.isNaN(time) ? Date.now() : time;
}

export type HeatCell = { date: string; count: number; future: boolean };

export function contributionWeeks(counts: Record<string, number>, weekCount = 53): HeatCell[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (weekCount - 1) * 7 - start.getDay());

  const cells: HeatCell[] = [];
  const cursor = new Date(start);
  const last = new Date(today);
  last.setDate(last.getDate() + (6 - last.getDay()));

  while (cursor <= last) {
    const date = dayKey(cursor.getTime());
    cells.push({
      date,
      count: counts[date] ?? 0,
      future: cursor.getTime() > today.getTime(),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: HeatCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}
