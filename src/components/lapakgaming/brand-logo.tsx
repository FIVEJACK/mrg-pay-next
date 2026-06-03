import { MultiRealmIcon } from "@/components/icon";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <MultiRealmIcon className={`block h-9 w-auto text-(--color-text-title) ${className ?? ""}`} />
  );
}
