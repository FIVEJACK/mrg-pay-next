const KEY = "mrg-pay:recent-emails";
const MAX = 3;

export function getRecentEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((e): e is string => typeof e === "string")
      : [];
  } catch {
    return [];
  }
}

/** Push `email` to the front of the recents list and persist. Returns the new list. */
export function addRecentEmail(email: string): string[] {
  const normalized = email.trim().toLowerCase();
  if (typeof window === "undefined" || !normalized) return getRecentEmails();
  const next = [normalized, ...getRecentEmails().filter((e) => e !== normalized)].slice(0, MAX);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode / quota) — non-fatal */
  }
  return next;
}
