export function HeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, var(--color-brand) 0%, transparent 35%), radial-gradient(circle at 90% 10%, var(--color-cyan-50) 0%, transparent 40%)",
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-b from-transparent to-white" />
    </div>
  );
}
