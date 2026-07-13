import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function AdminLeadDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      consumer: true,
      property: { include: { suburb: true } },
      consentRecord: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!lead) {
    notFound();
  }

  const payload = lead.payload as Record<string, unknown>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/admin/dashboard" className="text-sm text-neutral-500 underline">
        ← Back to leads
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {lead.type} lead — {lead.status}
        </h1>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Consumer</h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-neutral-500">Name</dt>
          <dd>{(payload.submittedName as string | undefined) ?? lead.consumer.name ?? "—"}</dd>
          <dt className="text-neutral-500">Email</dt>
          <dd>{lead.consumer.email ?? "—"}</dd>
          <dt className="text-neutral-500">Phone</dt>
          <dd>{lead.consumer.phone ?? "—"}</dd>
        </dl>
        <p className="mt-2 text-xs text-neutral-400">
          Name shown is as submitted with this lead. Email/phone reflect this person&apos;s latest
          known contact details across all their leads.
        </p>
      </section>

      {lead.property && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Property</h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <dt className="text-neutral-500">Address</dt>
            <dd>{lead.property.streetAddress}</dd>
            <dt className="text-neutral-500">Suburb</dt>
            <dd>
              {lead.property.suburb.name} {lead.property.suburb.postcode}
            </dd>
            <dt className="text-neutral-500">Type</dt>
            <dd>{lead.property.propertyType}</dd>
            {lead.property.estimatedValue && (
              <>
                <dt className="text-neutral-500">Estimated value</dt>
                <dd>${lead.property.estimatedValue.toString()}</dd>
              </>
            )}
          </dl>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Details</h2>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {Object.entries(payload)
            .filter(([key]) => key !== "submittedName")
            .map(([key, value]) => (
              <Fragment key={key}>
                <dt className="text-neutral-500">{key}</dt>
                <dd>{value === null || value === "" ? "—" : String(value)}</dd>
              </Fragment>
            ))}
        </dl>
      </section>

      {lead.notes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Notes</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {lead.notes.map((note) => (
              <li
                key={note.id}
                className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950"
              >
                {note.body}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">History</h2>
        <ul className="mt-2 flex flex-col gap-2 text-sm">
          {lead.statusHistory.map((event) => (
            <li key={event.id} className="flex justify-between border-b border-neutral-100 pb-2 dark:border-neutral-900">
              <span>
                {event.fromStatus ? `${event.fromStatus} → ${event.toStatus}` : event.toStatus}
                {event.note && <span className="text-neutral-500"> — {event.note}</span>}
              </span>
              <span className="text-neutral-400">
                {event.createdAt.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
