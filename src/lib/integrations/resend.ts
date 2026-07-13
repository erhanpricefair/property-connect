import { Resend } from "resend";

// Thin wrapper so provider-specific SDK usage stays in one place — see
// docs/ARCHITECTURE.md §9 (never call Resend directly from route handlers).
export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "PropertyConnect <onboarding@resend.dev>";

export const LEAD_NOTIFICATION_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL;
