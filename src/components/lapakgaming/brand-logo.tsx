export function BrandLogo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/lapakgaming-logo.svg"
      alt="LapakGaming"
      width={160}
      height={36}
      className={`block h-9 w-auto ${className ?? ""}`}
    />
  );
}
