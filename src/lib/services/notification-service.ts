import { db } from "@/lib/db";
import { resend, EMAIL_FROM, LEAD_NOTIFICATION_EMAIL } from "@/lib/integrations/resend";
import type { Lead } from "@prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://property-connect-taupe.vercel.app";

/**
 * Notifies the team of a new lead and confirms receipt with the consumer.
 * Deliberately fails open: a notification failure must never fail the lead
 * submission itself — the lead is already safely in the database by the
 * time this runs. Errors are logged, not thrown.
 */
export async function sendNewLeadNotifications(params: {
  lead: Lead;
  consumerId: string;
  consumerEmail: string | null;
  consumerName: string | null;
  // Short human-readable description of the lead for email subject/body —
  // e.g. "3 Smith St, Richmond VIC 3121" for Sell/Inspection/Conveyancing/
  // Property Management, "Richmond, Hawthorn · $600k–$750k" for Buy.
  summary: string;
}) {
  const { lead, consumerId, consumerEmail, consumerName, summary } = params;

  console.log("[notifications] sending for lead", lead.id, {
    from: EMAIL_FROM,
    adminRecipientSet: !!LEAD_NOTIFICATION_EMAIL,
    resendKeySet: !!process.env.RESEND_API_KEY,
  });

  await Promise.allSettled([
    notifyAdmin({ lead, summary }),
    consumerEmail
      ? notifyConsumer({ lead, consumerId, consumerEmail, consumerName })
      : Promise.resolve(),
  ]);
}

async function notifyAdmin({ lead, summary }: { lead: Lead; summary: string }) {
  if (!LEAD_NOTIFICATION_EMAIL) {
    console.warn("[notifications] LEAD_NOTIFICATION_EMAIL not set — skipping admin notification");
    return;
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: LEAD_NOTIFICATION_EMAIL,
      subject: `New ${lead.type} lead — ${summary}`,
      html: `
        <p>A new <strong>${lead.type}</strong> lead just came in.</p>
        <ul>
          <li><strong>Details:</strong> ${summary}</li>
          <li><strong>Status:</strong> ${lead.status}</li>
        </ul>
        <p><a href="${APP_URL}/admin/leads/${lead.id}">View lead in admin console</a></p>
      `,
    });

    if (result.error) {
      console.error("[notifications] Resend rejected admin notification", result.error);
    } else {
      console.log("[notifications] admin notification sent", result.data?.id);
    }

    await logNotification({
      recipientType: "ADMIN",
      channel: "EMAIL",
      template: "lead-admin-notification",
      leadId: lead.id,
      providerMessageId: result.data?.id,
      status: result.error ? "FAILED" : "SENT",
    });
  } catch (err) {
    console.error("[notifications] failed to send admin notification", err);
    await logNotification({
      recipientType: "ADMIN",
      channel: "EMAIL",
      template: "lead-admin-notification",
      leadId: lead.id,
      status: "FAILED",
    });
  }
}

async function notifyConsumer({
  lead,
  consumerId,
  consumerEmail,
  consumerName,
}: {
  lead: Lead;
  consumerId: string;
  consumerEmail: string;
  consumerName: string | null;
}) {
  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: consumerEmail,
      subject: "We've received your details — ReferWise",
      html: `
        <p>Hi ${consumerName ?? "there"},</p>
        <p>Thanks for reaching out to ReferWise. We've got your details and a local
        professional will be in touch soon.</p>
        <p><a href="${APP_URL}/confirmation/${lead.id}">View your submission</a></p>
      `,
    });

    if (result.error) {
      console.error("[notifications] Resend rejected consumer confirmation", result.error);
    } else {
      console.log("[notifications] consumer confirmation sent", result.data?.id);
    }

    await logNotification({
      recipientType: "CONSUMER",
      consumerId,
      channel: "EMAIL",
      template: "lead-consumer-confirmation",
      leadId: lead.id,
      providerMessageId: result.data?.id,
      status: result.error ? "FAILED" : "SENT",
    });
  } catch (err) {
    console.error("[notifications] failed to send consumer confirmation", err);
    await logNotification({
      recipientType: "CONSUMER",
      consumerId,
      channel: "EMAIL",
      template: "lead-consumer-confirmation",
      leadId: lead.id,
      status: "FAILED",
    });
  }
}

export async function sendAssignmentNotification(params: {
  lead: Lead;
  partnerId: string;
  partnerEmail: string | null;
  partnerName: string | null;
  summary: string;
}) {
  const { lead, partnerId, partnerEmail, partnerName, summary } = params;

  if (!partnerEmail) {
    console.warn("[notifications] partner has no email — skipping assignment notification", partnerId);
    return;
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: partnerEmail,
      subject: `New ${lead.type} lead assigned to you — ${summary}`,
      html: `
        <p>Hi ${partnerName ?? "there"},</p>
        <p>A new <strong>${lead.type}</strong> lead has been assigned to you.</p>
        <ul>
          <li><strong>Details:</strong> ${summary}</li>
        </ul>
        <p><a href="${APP_URL}/partner/dashboard">View it in your dashboard</a></p>
      `,
    });

    if (result.error) {
      console.error("[notifications] Resend rejected partner assignment notification", result.error);
    } else {
      console.log("[notifications] partner assignment notification sent", result.data?.id);
    }

    await logNotification({
      recipientType: "PARTNER",
      partnerId,
      channel: "EMAIL",
      template: "lead-assignment-notification",
      leadId: lead.id,
      providerMessageId: result.data?.id,
      status: result.error ? "FAILED" : "SENT",
    });
  } catch (err) {
    console.error("[notifications] failed to send partner assignment notification", err);
    await logNotification({
      recipientType: "PARTNER",
      partnerId,
      channel: "EMAIL",
      template: "lead-assignment-notification",
      leadId: lead.id,
      status: "FAILED",
    });
  }
}

async function logNotification(params: {
  recipientType: "ADMIN" | "CONSUMER" | "PARTNER";
  consumerId?: string;
  partnerId?: string;
  channel: "EMAIL" | "SMS";
  template: string;
  leadId: string;
  providerMessageId?: string;
  status: "SENT" | "FAILED";
}) {
  try {
    await db.notification.create({
      data: {
        recipientType: params.recipientType,
        consumerId: params.consumerId,
        partnerId: params.partnerId,
        channel: params.channel,
        template: params.template,
        leadId: params.leadId,
        providerMessageId: params.providerMessageId,
        status: params.status,
        sentAt: params.status === "SENT" ? new Date() : undefined,
      },
    });
  } catch (err) {
    // Logging the notification is best-effort — never let this fail the request.
    console.error("[notifications] failed to record Notification row", err);
  }
}
