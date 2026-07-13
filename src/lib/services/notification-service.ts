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
  suburbLabel: string;
  streetAddress: string;
}) {
  const { lead, consumerId, consumerEmail, consumerName, suburbLabel, streetAddress } = params;

  await Promise.allSettled([
    notifyAdmin({ lead, suburbLabel, streetAddress }),
    consumerEmail
      ? notifyConsumer({ lead, consumerId, consumerEmail, consumerName })
      : Promise.resolve(),
  ]);
}

async function notifyAdmin({
  lead,
  suburbLabel,
  streetAddress,
}: {
  lead: Lead;
  suburbLabel: string;
  streetAddress: string;
}) {
  if (!LEAD_NOTIFICATION_EMAIL) {
    console.warn("[notifications] LEAD_NOTIFICATION_EMAIL not set — skipping admin notification");
    return;
  }

  try {
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: LEAD_NOTIFICATION_EMAIL,
      subject: `New ${lead.type} lead — ${suburbLabel}`,
      html: `
        <p>A new <strong>${lead.type}</strong> lead just came in.</p>
        <ul>
          <li><strong>Address:</strong> ${streetAddress}, ${suburbLabel}</li>
          <li><strong>Status:</strong> ${lead.status}</li>
        </ul>
        <p><a href="${APP_URL}/admin/leads/${lead.id}">View lead in admin console</a></p>
      `,
    });

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
      subject: "We've received your details — PropertyConnect",
      html: `
        <p>Hi ${consumerName ?? "there"},</p>
        <p>Thanks for reaching out to PropertyConnect. We've got your details and a local
        professional will be in touch soon.</p>
        <p><a href="${APP_URL}/confirmation/${lead.id}">View your submission</a></p>
      `,
    });

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

async function logNotification(params: {
  recipientType: "ADMIN" | "CONSUMER";
  consumerId?: string;
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
