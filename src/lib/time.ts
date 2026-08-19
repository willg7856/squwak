export function relativeTime(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
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
