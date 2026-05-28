"use client";

type BuyerInfoCardProps = {
  email: string;
  onEmailChange: (value: string) => void;
  error?: string | null;
};

export function BuyerInfoCard({ email, onEmailChange, error }: BuyerInfoCardProps) {
  return (
    <section className="flex w-full flex-col gap-3">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold leading-[26px] text-(--color-text-title)">
        Informasi Pembeli
      </h2>
      <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border-low) bg-white p-6 lg:flex-row lg:items-start lg:gap-4">
        <label className="flex w-full flex-col gap-1 lg:max-w-[414.5px]">
          <span className="font-[family-name:var(--font-heading)] text-sm leading-5 text-(--color-text-secondary)">
            Email pembeli
          </span>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="Masukkan alamat email"
            aria-invalid={error ? true : undefined}
            className="h-11 w-full rounded-2xl border border-(--color-border) bg-(--color-surface) px-3 text-base leading-6 text-(--color-text-body) placeholder:text-(--color-text-subdued) outline-none focus:border-(--color-brand)"
          />
          {error && (
            <span role="alert" className="text-xs leading-4 text-(--color-promotion)">
              {error}
            </span>
          )}
        </label>
        <p className="flex-1 self-center font-[family-name:var(--font-heading)] text-sm leading-5 text-(--color-text-subdued) lg:pt-6">
          Kami akan menghubungimu lewat email ini jika terdapat kendala pada transaksimu.
        </p>
      </div>
    </section>
  );
}
