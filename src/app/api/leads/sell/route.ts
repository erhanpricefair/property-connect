import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sellLeadSchema, SUBURB_NOT_LISTED } from "@/lib/validations/lead";
import { sendNewLeadNotifications } from "@/lib/services/notification-service";
import { findOrCreateConsumer } from "@/lib/services/consumer-service";

const CONSENT_TEXT_VERSION = "2026-07-v1";
const DUPLICATE_WINDOW_DAYS = 30;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }

  const parsed = sellLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const isServiceable = input.suburbId !== SUBURB_NOT_LISTED;

  let suburb = null;
  if (isServiceable) {
    suburb = await db.suburb.findUnique({ where: { id: input.suburbId } });
    if (!suburb) {
      return NextResponse.json(
        { error: { message: "Validation failed", fieldErrors: { suburbId: ["Please select a valid suburb"] } } },
        { status: 400 }
      );
    }
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const consumer = await findOrCreateConsumer(input.email, input.phone, input.name);

  const duplicateWindowStart = new Date(Date.now() - DUPLICATE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const existingMatch = await db.lead.findFirst({
    where: {
      consumerId: consumer.id,
      type: "SELL",
      createdAt: { gte: duplicateWindowStart },
      payload: { path: ["streetAddress"], equals: input.streetAddress },
    },
  });

  const property = suburb
    ? await db.property.create({
        data: {
          suburbId: suburb.id,
          streetAddress: input.streetAddress,
          propertyType: input.propertyType,
          estimatedValue: input.estimatedValue ?? undefined,
        },
      })
    : null;

  const consentRecord = await db.consentRecord.create({
    data: {
      textVersion: CONSENT_TEXT_VERSION,
      consentType: "GENERAL_CONTACT",
      ipAddress,
    },
  });

  const lead = await db.lead.create({
    data: {
      type: "SELL",
      status: isServiceable ? "NEW" : "UNSERVICEABLE",
      consumerId: consumer.id,
      propertyId: property?.id,
      consentRecordId: consentRecord.id,
      payload: {
        streetAddress: input.streetAddress,
        suburbName: suburb?.name ?? input.unlistedSuburb,
        estimatedValue: input.estimatedValue ?? null,
        sellingTimeframe: input.sellingTimeframe,
        currentSituation: input.currentSituation ?? null,
        possibleDuplicate: !!existingMatch,
      },
    },
  });

  await db.leadStatusHistory.create({
    data: {
      leadId: lead.id,
      toStatus: lead.status,
      actorType: "CONSUMER",
      note: "Lead submitted",
    },
  });

  if (existingMatch) {
    await db.note.create({
      data: {
        authorType: "SYSTEM",
        body: `Possible duplicate: matching address submitted by the same consumer within the last ${DUPLICATE_WINDOW_DAYS} days (lead ${existingMatch.id}).`,
        leadId: lead.id,
      },
    });
  }

  const suburbLabel = suburb ? `${suburb.name} ${suburb.postcode}` : (input.unlistedSuburb ?? "unlisted suburb");

  await sendNewLeadNotifications({
    lead,
    consumerId: consumer.id,
    consumerEmail: consumer.email,
    consumerName: consumer.name,
    summary: `${input.streetAddress}, ${suburbLabel}`,
  });

  return NextResponse.json({ data: { leadId: lead.id, status: lead.status } }, { status: 201 });
}
