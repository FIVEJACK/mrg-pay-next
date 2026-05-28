import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Product and revenue analytics",
};

const kpis = [
  { label: "Page views", value: "128k" },
  { label: "Signups", value: "1.4k" },
  { label: "Churn", value: "2.1%" },
];

export default function AnalyticsPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Example KPIs — each route is its own file under{" "}
          <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs dark:bg-zinc-800">app/</code>.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {k.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{k.value}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
