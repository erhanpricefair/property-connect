import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { financeLeadSchema, LOAN_PURPOSE_LABELS } from "@/lib/validations/lead";
import { sendNewLeadNotifications } from "@/lib/services/notification-service";
import { findOrCreateConsumer } from "@/lib/services/consumer-service";

const CONSENT_TEXT_VERSION = "2026-07-finance-v1";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }

  const parsed = financeLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const consumer = await findOrCreateConsumer(input.email, input.phone, input.name);

  // A single ConsentRecord covers both the general-contact and financial-disclosure
  // checkboxes — both are required by the schema before this route is ever reached,
  // so recording the stronger (financial) consent type is an accurate summary.
  const consentRecord = await db.consentRecord.create({
    data: { textVersion: CONSENT_TEXT_VERSION, consentType: "FINANCIAL_DISCLOSURE", ipAddress },
  });

  const lead = await db.lead.create({
    data: {
      type: "FINANCE",
      status: "NEW",
      consumerId: consumer.id,
      consentRecordId: consentRecord.id,
      payload: {
        submittedName: input.name,
        purchasePrice: input.purchasePrice,
        depositAmount: input.depositAmount,
        depositExceedsPrice: input.depositAmount > input.purchasePrice,
        incomeBand: input.incomeBand,
        incomeExact: input.incomeExact ?? null,
        loanPurpose: input.loanPurpose,
      },
    },
  });

  await db.leadStatusHistory.create({
    data: { leadId: lead.id, toStatus: lead.status, actorType: "CONSUMER", note: "Lead submitted" },
  });

  await sendNewLeadNotifications({
    lead,
    consumerId: consumer.id,
    consumerEmail: consumer.email,
    consumerName: consumer.name,
    summary: `$${input.purchasePrice.toLocaleString()} purchase · ${LOAN_PURPOSE_LABELS[input.loanPurpose] ?? input.loanPurpose}`,
  });

  return NextResponse.json({ data: { leadId: lead.id, status: lead.status } }, { status: 201 });
}
