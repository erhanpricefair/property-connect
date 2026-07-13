import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  otherServicesLeadSchema,
  SUBURB_NOT_LISTED,
  INSPECTION_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/validations/lead";
import { sendNewLeadNotifications } from "@/lib/services/notification-service";
import { findOrCreateConsumer } from "@/lib/services/consumer-service";
import type { LeadType, Prisma, PropertyType } from "@prisma/client";

const CONSENT_TEXT_VERSION = "2026-07-v1";
const URGENT_WINDOW_DAYS = 5;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }

  const parsed = otherServicesLeadSchema.safeParse(body);
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

  const suburbLabel = suburb ? `${suburb.name} ${suburb.postcode}` : (input.unlistedSuburb ?? "unlisted suburb");
  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const consumer = await findOrCreateConsumer(input.email, input.phone, input.name);

  const property = suburb
    ? await db.property.create({
        data: {
          suburbId: suburb.id,
          streetAddress: input.streetAddress,
          propertyType: (input.serviceType === "PROPERTY_MANAGEMENT" ? input.propertyType : "OTHER") as PropertyType,
        },
      })
    : null;

  const consentRecord = await db.consentRecord.create({
    data: { textVersion: CONSENT_TEXT_VERSION, consentType: "GENERAL_CONTACT", ipAddress },
  });

  const { leadType, payload, summary } = buildTypeSpecifics(input, suburbLabel);

  const lead = await db.lead.create({
    data: {
      type: leadType,
      status: isServiceable ? "NEW" : "UNSERVICEABLE",
      consumerId: consumer.id,
      propertyId: property?.id,
      consentRecordId: consentRecord.id,
      payload,
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
    summary,
  });

  return NextResponse.json({ data: { leadId: lead.id, status: lead.status } }, { status: 201 });
}

function buildTypeSpecifics(
  input: import("@/lib/validations/lead").OtherServicesLeadInput,
  suburbLabel: string
): { leadType: LeadType; payload: Prisma.InputJsonObject; summary: string } {
  if (input.serviceType === "INSPECTION") {
    return {
      leadType: "INSPECTION",
      payload: {
        submittedName: input.name,
        streetAddress: input.streetAddress,
        suburbLabel,
        inspectionType: input.inspectionType,
        requiredByDate: input.requiredByDate,
      },
      summary: `${INSPECTION_TYPE_LABELS[input.inspectionType]} — ${input.streetAddress}, ${suburbLabel}`,
    };
  }

  if (input.serviceType === "CONVEYANCING") {
    const isUrgent = isWithinBusinessDays(input.settlementDate, URGENT_WINDOW_DAYS);
    return {
      leadType: "CONVEYANCING",
      payload: {
        submittedName: input.name,
        streetAddress: input.streetAddress,
        suburbLabel,
        transactionType: input.transactionType,
        settlementDate: input.settlementDate,
        urgent: isUrgent,
      },
      summary: `${TRANSACTION_TYPE_LABELS[input.transactionType]}, settlement ${input.settlementDate}${
        isUrgent ? " (urgent)" : ""
      } — ${input.streetAddress}, ${suburbLabel}`,
    };
  }

  return {
    leadType: "PROPERTY_MANAGEMENT",
    payload: {
      submittedName: input.name,
      streetAddress: input.streetAddress,
      suburbLabel,
      propertyType: input.propertyType,
      currentStatus: input.currentStatus,
      desiredStartDate: input.desiredStartDate,
    },
    summary: `Property management — ${input.streetAddress}, ${suburbLabel}`,
  };
}

function isWithinBusinessDays(dateStr: string, businessDays: number) {
  const target = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let count = 0;
  const cursor = new Date(today);
  while (cursor < target) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    if (count > businessDays) return false;
  }
  return count <= businessDays;
}
