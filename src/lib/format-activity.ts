const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

/**
 * Relative-time text for a seller's `last_activity_time`. Mirrors the
 * itemku spec: `aktif {detik|menit|jam|hari} lalu`, falling back to
 * "terakhir online udah lama banget" when the timestamp is missing.
 *
 * Hardcoded Indonesian for now — wire to `next-intl` when we re-enable
 * English in `src/i18n/routing.ts`.
 */
export function formatLastActivity(value: string | Date | null | undefined, now: Date = new Date()): string {
  if (!value) return "More than Weeks ago";

  // Normalize "YYYY-MM-DD HH:mm:ss" → ISO for Safari parsing.
  const raw = typeof value === "string"
    ? (value.includes("T") ? value : value.replace(" ", "T"))
    : value;
  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return "More than Weeks ago";

  const diff = Math.max(0, now.getTime() - t);

  let interval: string;
  if (diff < ONE_MINUTE) {
    interval = `${Math.floor(diff / 1000)} detik`;
  } else if (diff < ONE_HOUR) {
    interval = `${Math.floor(diff / ONE_MINUTE)} menit`;
  } else if (diff < ONE_DAY) {
    interval = `${Math.floor(diff / ONE_HOUR)} jam`;
  } else {
    interval = `${Math.floor(diff / ONE_DAY)} hari`;
  }
  return `Aktif ${interval} lalu`;
}

/**
 * Heuristic for the online-dot color. "Recent" (≤ 5 min) gets the green
 * Online treatment; everything else falls back to a grey/idle look.
 */
export function isRecentActivity(value: string | Date | null | undefined, now: Date = new Date()): boolean {
  if (!value) return false;
  const raw = typeof value === "string"
    ? (value.includes("T") ? value : value.replace(" ", "T"))
    : value;
  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return false;
  return now.getTime() - t < 5 * ONE_MINUTE;
}
