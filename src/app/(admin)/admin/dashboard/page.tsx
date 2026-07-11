import Link from "next/link";
import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  MATCHING: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  ASSIGNED: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  ACCEPTED: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  IN_PROGRESS: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  OUTCOME_PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  CLOSED_WON: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  CLOSED_LOST: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  UNMATCHED: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  UNSERVICEABLE: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  WITHDRAWN: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

export default async function AdminDashboard() {
  const [leads, statusCounts] = await Promise.all([
    db.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        consumer: { select: { name: true, email: true, phone: true } },
        property: { include: { suburb: { select: { name: true, postcode: true } } } },
      },
    }),
    db.lead.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin console</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {leads.length} most recent lead{leads.length === 1 ? "" : "s"}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {statusCounts.map((row) => (
          <div
            key={row.status}
            className="rounded border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-800"
          >
            <span className="font-medium">{row._count._all}</span>{" "}
            <span className="text-neutral-500">{row.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800">
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Consumer</th>
              <th className="py-2 pr-4 font-medium">Suburb</th>
              <th className="py-2 pr-4 font-medium">Submitted</th>
              <th className="py-2 pr-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="py-2 pr-4">{lead.type}</td>
                <td className="py-2 pr-4">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[lead.status] ?? "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="py-2 pr-4">{lead.consumer.name ?? lead.consumer.email ?? "—"}</td>
                <td className="py-2 pr-4">
                  {lead.property?.suburb
                    ? `${lead.property.suburb.name} ${lead.property.suburb.postcode}`
                    : "—"}
                </td>
                <td className="py-2 pr-4 text-neutral-500">
                  {lead.createdAt.toLocaleString("en-AU", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="py-2 pr-4">
                  <Link href={`/admin/leads/${lead.id}`} className="text-neutral-900 underline dark:text-neutral-100">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-500">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
