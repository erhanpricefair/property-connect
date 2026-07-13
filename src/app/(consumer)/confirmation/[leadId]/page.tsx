import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;

  const lead = await db.lead.findUnique({
    where: { id: leadId },
    select: { id: true, type: true, status: true, createdAt: true },
  });

  if (!lead) {
    notFound();
  }

  const isServiceable = lead.status !== "UNSERVICEABLE";

  const PROFESSIONAL_LABELS: Record<string, string> = {
    SELL: "agent",
    BUY: "agent",
    FINANCE: "mortgage broker",
    INSPECTION: "building inspector",
    CONVEYANCING: "conveyancer",
    PROPERTY_MANAGEMENT: "property manager",
  };
  const professional = PROFESSIONAL_LABELS[lead.type] ?? "professional";

  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">
        {isServiceable ? "Thanks — we've got your details" : "Thanks for your interest"}
      </h1>
      <p className="mt-4 text-neutral-600 dark:text-neutral-400">
        {isServiceable
          ? `A local ${professional} will be in touch within 24 hours.`
          : "We're Melbourne-only at the moment, but we've saved your details and will let you know as soon as we cover your area."}
      </p>
      <p className="mt-6 text-xs text-neutral-400">Reference: {lead.id}</p>
    </main>
  );
}
