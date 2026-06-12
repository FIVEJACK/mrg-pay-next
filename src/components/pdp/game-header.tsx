import { MrgImage } from "@/components/shared/mrg-image";

type GameHeaderProps = {
  name: string;
  logoUrl?: string | null;
  ctaLabel?: string;
};

export function GameHeader({ name, logoUrl }: GameHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface-secondary)]">
        {logoUrl ? (
          <MrgImage
            src={logoUrl}
            alt={`${name} logo`}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[var(--color-text-subdued)]">
            {name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="font-[family-name:var(--font-heading)] text-[28px] font-bold leading-[34px] text-[#141414]">
          {name}
        </h1>
      </div>
    </div>
  );
}
