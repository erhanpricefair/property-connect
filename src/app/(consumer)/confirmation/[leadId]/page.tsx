import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ConsumerHeader } from "@/components/marketing/consumer-header";

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
    <div className="min-h-screen bg-[#F3EFE6] font-[family-name:var(--font-work-sans)]">
      <ConsumerHeader />
      <main className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-[family-name:var(--font-fraunces)] text-4xl tracking-tight text-[#16201B]">
          {isServiceable ? "Thanks — we've got your details" : "Thanks for your interest"}
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#16201B]/70">
          {isServiceable
            ? `A local ${professional} will be in touch within 24 hours.`
            : "We're Melbourne-only at the moment, but we've saved your details and will let you know as soon as we cover your area."}
        </p>
        <p className="mt-8 font-[family-name:var(--font-plex-mono)] text-[11px] uppercase tracking-[0.1em] text-[#16201B]/40">
          Reference: {lead.id}
        </p>
      </main>
    </div>
  );
}
