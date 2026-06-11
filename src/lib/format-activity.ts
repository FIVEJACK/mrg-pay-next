const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;

const ONLINE_WINDOW = 10 * ONE_MINUTE;
const MAX_DAYS = 7;

export type SellerActivity = {
  online: boolean;
  label: string;
};

function parseActivityTime(value: string | Date | null | undefined): number {
  if (!value) return NaN;
  const raw =
    typeof value === "string" ? (value.includes("T") ? value : value.replace(" ", "T")) : value;
  return new Date(raw).getTime();
}

export function getSellerActivity(
  value: string | Date | null | undefined,
  now: Date = new Date(),
): SellerActivity {
  const t = parseActivityTime(value);
  if (!Number.isFinite(t)) return { online: false, label: ">7 Hari Lalu" };

  const diff = Math.max(0, now.getTime() - t);
  if (diff < ONLINE_WINDOW) return { online: true, label: "Online" };
  if (diff < ONE_HOUR) return { online: false, label: `${Math.floor(diff / ONE_MINUTE)} Menit Lalu` };
  if (diff < ONE_DAY) return { online: false, label: `${Math.floor(diff / ONE_HOUR)} Jam Lalu` };

  const days = Math.floor(diff / ONE_DAY);
  if (days > MAX_DAYS) return { online: false, label: ">7 Hari Lalu" };
  return { online: false, label: `${days} Hari Lalu` };
}
