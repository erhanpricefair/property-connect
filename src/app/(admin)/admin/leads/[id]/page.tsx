import { Fragment } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const LEAD_STATUS_VALUES = [
  "NEW",
  "MATCHING",
  "ASSIGNED",
  "ACCEPTED",
  "IN_PROGRESS",
  "OUTCOME_PENDING",
  "CLOSED_WON",
  "CLOSED_LOST",
  "UNMATCHED",
  "UNSERVICEABLE",
  "WITHDRAWN",
] as const;

async function updateLeadStatus(leadId: string, formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT_ADMIN")) {
    return;
  }

  const rawStatus = formData.get("status");
  const note = formData.get("note");
  if (typeof rawStatus !== "string" || !LEAD_STATUS_VALUES.includes(rawStatus as (typeof LEAD_STATUS_VALUES)[number])) {
    return;
  }
  const toStatus = rawStatus as (typeof LEAD_STATUS_VALUES)[number];

  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { status: true } });
  if (!lead) return;

  await db.$transaction([
    db.lead.update({ where: { id: leadId }, data: { status: toStatus } }),
    db.leadStatusHistory.create({
      data: {
        leadId,
        fromStatus: lead.status,
        toStatus,
        actorType: "ADMIN",
        actorId: session.user.id,
        note: typeof note === "string" && note.trim() ? note.trim() : undefined,
      },
    }),
  ]);

  revalidatePath(`/admin/leads/${leadId}`);
}

async function addNote(leadId: string, formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT_ADMIN")) {
    return;
  }

  const body = formData.get("body");
  if (typeof body !== "string" || !body.trim()) return;

  await db.note.create({
    data: { leadId, authorType: "ADMIN", authorId: session.user.id, body: body.trim() },
  });

  revalidatePath(`/admin/leads/${leadId}`);
}

export default async function AdminLeadDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
  const updateLeadStatusWithId = updateLeadStatus.bind(null, lead.id);
  const addNoteWithId = addNote.bind(null, lead.id);

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

      <section className="mt-6 rounded border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Change status</h2>
        <form action={updateLeadStatusWithId} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="status" className="text-xs text-neutral-500">
              New status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={lead.status}
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              {LEAD_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor="note" className="text-xs text-neutral-500">
              Note <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              id="note"
              name="note"
              placeholder="e.g. spoke to consumer, appraisal booked for Thursday"
              className="w-full rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <button
            type="submit"
            className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-neutral-900"
          >
            Update
          </button>
        </form>
      </section>

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

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Notes</h2>
        <form action={addNoteWithId} className="mt-2 flex gap-2">
          <input
            name="body"
            placeholder="Add a note…"
            required
            className="flex-1 rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            type="submit"
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
          >
            Add
          </button>
        </form>
        {lead.notes.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {lead.notes.map((note) => (
              <li
                key={note.id}
                className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950"
              >
                {note.body}
              </li>
            ))}
          </ul>
        )}
      </section>

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
