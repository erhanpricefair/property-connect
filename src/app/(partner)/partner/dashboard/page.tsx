import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

const PARTNER_STATUS_VALUES = [
  "IN_PROGRESS",
  "OUTCOME_PENDING",
  "CLOSED_WON",
  "CLOSED_LOST",
  "WITHDRAWN",
] as const;

async function respondToAssignment(assignmentId: string, formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "PARTNER") return;

  const decision = formData.get("decision");
  if (decision !== "ACCEPTED" && decision !== "DECLINED") return;

  const assignment = await db.leadAssignment.findUnique({
    where: { id: assignmentId },
    include: { partner: true, lead: true },
  });
  if (!assignment || assignment.partner.userId !== session.user.id) return;
  if (assignment.status !== "ASSIGNED") return;

  const newLeadStatus = decision === "ACCEPTED" ? "ACCEPTED" : "UNMATCHED";

  await db.$transaction([
    db.leadAssignment.update({
      where: { id: assignmentId },
      data: { status: decision, respondedAt: new Date() },
    }),
    db.lead.update({ where: { id: assignment.leadId }, data: { status: newLeadStatus } }),
    db.leadStatusHistory.create({
      data: {
        leadId: assignment.leadId,
        fromStatus: assignment.lead.status,
        toStatus: newLeadStatus,
        actorType: "PARTNER",
        actorId: session.user.id,
        note: decision === "ACCEPTED" ? "Partner accepted" : "Partner declined",
      },
    }),
  ]);

  revalidatePath("/partner/dashboard");
}

async function updateLeadProgress(leadId: string, formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "PARTNER") return;

  const rawStatus = formData.get("status");
  if (
    typeof rawStatus !== "string" ||
    !PARTNER_STATUS_VALUES.includes(rawStatus as (typeof PARTNER_STATUS_VALUES)[number])
  ) {
    return;
  }
  const toStatus = rawStatus as (typeof PARTNER_STATUS_VALUES)[number];

  const partner = await db.partner.findUnique({ where: { userId: session.user.id } });
  if (!partner) return;

  const assignment = await db.leadAssignment.findFirst({
    where: { leadId, partnerId: partner.id },
    include: { lead: true },
  });
  if (!assignment || assignment.status !== "ACCEPTED") return;

  await db.$transaction([
    db.lead.update({ where: { id: leadId }, data: { status: toStatus } }),
    db.leadStatusHistory.create({
      data: {
        leadId,
        fromStatus: assignment.lead.status,
        toStatus,
        actorType: "PARTNER",
        actorId: session.user.id,
      },
    }),
  ]);

  revalidatePath("/partner/dashboard");
}

export default async function PartnerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const partner = await db.partner.findUnique({ where: { userId: session.user.id } });
  if (!partner) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Partner dashboard</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          No partner profile is linked to this account yet. Contact the ReferWise team.
        </p>
      </main>
    );
  }

  const assignments = await db.leadAssignment.findMany({
    where: { partnerId: partner.id },
    orderBy: { assignedAt: "desc" },
    include: {
      lead: { include: { consumer: true, property: { include: { suburb: true } } } },
    },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{partner.businessName}</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {assignments.length} lead{assignments.length === 1 ? "" : "s"} assigned to you
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/partner-agreement"
            target="_blank"
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700"
          >
            Referral agreement
          </Link>
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
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {assignments.map((assignment) => {
          const lead = assignment.lead;
          const payload = lead.payload as Record<string, unknown>;
          const suburbLabel =
            lead.property?.suburb?.name ??
            (typeof payload.suburbLabel === "string" ? payload.suburbLabel : "—");
          const respondToAssignmentWithId = respondToAssignment.bind(null, assignment.id);
          const updateLeadProgressWithId = updateLeadProgress.bind(null, lead.id);
          const isPending = assignment.status === "ASSIGNED";
          const isAccepted = assignment.status === "ACCEPTED";

          return (
            <div key={assignment.id} className="rounded border border-neutral-200 p-4 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {lead.type} — {suburbLabel}
                </span>
                <span className="text-xs uppercase tracking-wide text-neutral-500">{assignment.status}</span>
              </div>

              {isPending && (
                <>
                  <p className="mt-2 text-sm text-neutral-500">
                    Respond by{" "}
                    {assignment.slaDeadline.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}.
                    Consumer contact details are revealed once you accept.
                  </p>
                  <form action={respondToAssignmentWithId} className="mt-3 flex gap-2">
                    <button
                      type="submit"
                      name="decision"
                      value="ACCEPTED"
                      className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-neutral-900"
                    >
                      Accept
                    </button>
                    <button
                      type="submit"
                      name="decision"
                      value="DECLINED"
                      className="rounded border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
                    >
                      Decline
                    </button>
                  </form>
                </>
              )}

              {assignment.status === "DECLINED" && (
                <p className="mt-2 text-sm text-neutral-500">You declined this lead.</p>
              )}

              {(isAccepted || ["IN_PROGRESS", "OUTCOME_PENDING", "CLOSED_WON", "CLOSED_LOST"].includes(lead.status)) && (
                <>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <dt className="text-neutral-500">Name</dt>
                    <dd>{(payload.submittedName as string | undefined) ?? lead.consumer.name ?? "—"}</dd>
                    <dt className="text-neutral-500">Email</dt>
                    <dd>{lead.consumer.email ?? "—"}</dd>
                    <dt className="text-neutral-500">Phone</dt>
                    <dd>{lead.consumer.phone ?? "—"}</dd>
                    {lead.property && (
                      <>
                        <dt className="text-neutral-500">Address</dt>
                        <dd>{lead.property.streetAddress}</dd>
                      </>
                    )}
                  </dl>

                  <form action={updateLeadProgressWithId} className="mt-3 flex items-center gap-2">
                    <select
                      name="status"
                      defaultValue={
                        PARTNER_STATUS_VALUES.includes(lead.status as (typeof PARTNER_STATUS_VALUES)[number])
                          ? lead.status
                          : "IN_PROGRESS"
                      }
                      className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      {PARTNER_STATUS_VALUES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
                    >
                      Update status
                    </button>
                  </form>
                </>
              )}
            </div>
          );
        })}

        {assignments.length === 0 && (
          <p className="text-neutral-500">No leads assigned yet.</p>
        )}
      </div>
    </main>
  );
}
