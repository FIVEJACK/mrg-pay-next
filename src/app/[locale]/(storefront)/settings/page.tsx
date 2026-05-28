import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Workspace preferences",
};

export default function SettingsPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Example form placeholders — sidebar highlights this route when active.
        </p>
      </div>

      <div className="max-w-lg space-y-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Workspace name
          <input
            type="text"
            defaultValue="Acme Admin"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input type="checkbox" defaultChecked className="rounded border-zinc-300" />
          Send weekly digest
        </label>
      </div>
    </main>
  );
}
