import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "Review and fulfill orders",
};

const orders = [
  { id: "#10501", customer: "Globex", total: "$420.00", placed: "Today" },
  { id: "#10500", customer: "Initech", total: "$89.99", placed: "Yesterday" },
];

export default function OrdersPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Example orders view — navigation stays in the shared layout.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {orders.map((o) => (
          <div
            key={o.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{o.id}</p>
            <p className="mt-1 text-sm font-semibold">{o.customer}</p>
            <p className="mt-2 text-lg font-semibold tabular-nums">{o.total}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{o.placed}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
