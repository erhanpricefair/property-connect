import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buyLeadSchema } from "@/lib/validations/lead";
import { sendNewLeadNotifications } from "@/lib/services/notification-service";
import { findOrCreateConsumer } from "@/lib/services/consumer-service";
import { checkSpamGuards, getClientIp } from "@/lib/services/spam-guard";

const CONSENT_TEXT_VERSION = "2026-07-v1";
const FINANCE_CONSENT_TEXT_VERSION = "2026-07-finance-v1";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }

  const ipAddress = getClientIp(request);
  const spamResponse = await checkSpamGuards(body, ipAddress);
  if (spamResponse) return spamResponse;

  const parsed = buyLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const suburbs = await db.suburb.findMany({ where: { id: { in: input.suburbIds } } });
  if (suburbs.length === 0) {
    return NextResponse.json(
      { error: { message: "Validation failed", fieldErrors: { suburbIds: ["Please select a valid suburb"] } } },
      { status: 400 }
    );
  }

  const suburbLabel = suburbs.map((s) => s.name).join(", ");

  const consumer = await findOrCreateConsumer(input.email, input.phone, input.name);

  const consentRecord = await db.consentRecord.create({
    data: { textVersion: CONSENT_TEXT_VERSION, consentType: "GENERAL_CONTACT", ipAddress },
  });

  const lead = await db.lead.create({
    data: {
      type: "BUY",
      status: "NEW",
      consumerId: consumer.id,
      consentRecordId: consentRecord.id,
      payload: {
        submittedName: input.name,
        suburbLabel,
        suburbNames: suburbs.map((s) => s.name),
        budgetMin: input.budgetMin ?? null,
        budgetMax: input.budgetMax ?? null,
        financeStatus: input.financeStatus,
        propertyType: input.propertyType ?? null,
        buyingTimeframe: input.buyingTimeframe,
      },
    },
  });

  await db.leadSuburbPreference.createMany({
    data: suburbs.map((s) => ({ leadId: lead.id, suburbId: s.id })),
  });

  await db.leadStatusHistory.create({
    data: { leadId: lead.id, toStatus: lead.status, actorType: "CONSUMER", note: "Lead submitted" },
  });

  if (input.wantsFinanceIntro && input.financeConsent) {
    const financeConsentRecord = await db.consentRecord.create({
      data: { textVersion: FINANCE_CONSENT_TEXT_VERSION, consentType: "FINANCIAL_DISCLOSURE", ipAddress },
    });

    const financeLead = await db.lead.create({
      data: {
        type: "FINANCE",
        status: "NEW",
        consumerId: consumer.id,
        consentRecordId: financeConsentRecord.id,
        sourceLeadId: lead.id,
        payload: {
          purchasePrice: input.budgetMax ?? input.budgetMin ?? null,
          loanPurpose: "UPGRADE",
          note: "Created via cross-sell from a Buy enquiry — details to be confirmed with the consumer.",
        },
      },
    });

    await db.leadStatusHistory.create({
      data: {
        leadId: financeLead.id,
        toStatus: financeLead.status,
        actorType: "CONSUMER",
        note: "Cross-sold from Buy enquiry",
      },
    });
  }

  await sendNewLeadNotifications({
    lead,
    consumerId: consumer.id,
    consumerEmail: consumer.email,
    consumerName: consumer.name,
    summary: `${suburbLabel} · ${budgetSummary(input.budgetMin, input.budgetMax)}`,
  });

  return NextResponse.json({ data: { leadId: lead.id, status: lead.status } }, { status: 201 });
}

function budgetSummary(min?: number, max?: number) {
  if (min && max) return `$${min.toLocaleString()}–$${max.toLocaleString()}`;
  if (max) return `up to $${max.toLocaleString()}`;
  if (min) return `from $${min.toLocaleString()}`;
  return "budget not specified";
}
