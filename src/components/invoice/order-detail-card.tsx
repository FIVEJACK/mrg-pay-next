import type { TransactionDetail } from "@/lib/partner-api";

type OrderDetailCardProps = {
  transaction: TransactionDetail;
  /** Label for the user-identifier field (e.g. "Roblox Username"). */
  userIdLabel: string;
  bare?: boolean;
};

export function OrderDetailCard({ transaction, userIdLabel, bare }: OrderDetailCardProps) {
  const order = transaction.orders[0];
  if (!order) return null;

  const requiredInfo = parseRequiredInfo(order.required_information);
  const userId = requiredInfo?.user_id ?? "—";

  return (
    <section
      className={
        bare
          ? "flex w-full flex-col gap-4 bg-white px-4 py-5"
          : "flex w-full flex-col gap-4 rounded-2xl border border-(--color-border-low) bg-white p-6"
      }
    >
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
        Detail Pesanan
      </h2>

      <div className="flex items-start gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-subtle)">
          {order.product_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={order.product_image}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-heading)] line-clamp-2 text-base font-bold leading-6 text-(--color-text-title)">
            {order.product_name}
          </p>
          {order.game_name && (
            <p className="font-[family-name:var(--font-heading)] truncate text-sm leading-5 text-(--color-text-subdued)">
              {order.game_name}
            </p>
          )}
        </div>
      </div>

      <dl className="flex flex-col gap-3">
        <Row label={userIdLabel} value={userId} bare={bare} />
        <Row label="Jumlah" value={String(order.quantity)} bare={bare} />
        <Row label="Email" value={order.buyer_email ?? "—"} bare={bare} />
      </dl>
    </section>
  );
}

function Row({ label, value, bare }: { label: string; value: string; bare?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <dt
        className={`shrink-0 font-[family-name:var(--font-heading)] text-base leading-6 text-(--color-text-secondary) ${
          bare ? "" : "w-[200px]"
        }`}
      >
        {label}
      </dt>
      <dd
        className={`min-w-0 flex-1 truncate font-[family-name:var(--font-heading)] text-base leading-6 text-(--color-text-title) ${
          bare ? "text-right" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function parseRequiredInfo(raw: string | undefined): Record<string, string> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}
