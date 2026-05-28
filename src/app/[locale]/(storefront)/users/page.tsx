import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
  description: "Manage workspace members",
};

const rows = [
  { name: "Jane Doe", email: "jane@example.com", role: "Admin" },
  { name: "Alex Kim", email: "alex@example.com", role: "Member" },
  { name: "Sam Patel", email: "sam@example.com", role: "Member" },
];

export default function UsersPage() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Example list — use the sidebar to move between sections.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">Team members</h2>
        </div>
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {rows.map((u) => (
            <li key={u.email} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</p>
              </div>
              <span className="mt-1 inline-flex w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 sm:mt-0">
                {u.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
