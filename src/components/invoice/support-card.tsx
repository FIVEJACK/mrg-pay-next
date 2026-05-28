import { HeadsetIcon } from "@/components/icon";

export function SupportCard() {
  return (
    <section className="flex items-center justify-between gap-4 rounded-2xl border border-(--color-border-low) bg-white px-6 py-4">
      <p className="font-[family-name:var(--font-heading)] text-sm leading-5 text-(--color-text-body)">
        Butuh bantuan terkait pesanan ini?
      </p>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-full border-2 border-(--color-brand) px-4 py-2 text-sm font-bold text-(--color-brand) transition hover:bg-(--color-surface-focus)"
      >
        <HeadsetIcon className="size-4" />
        Hubungi CS
      </button>
    </section>
  );
}
