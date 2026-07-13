import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;
const HONEYPOT_FIELD = "website";

export function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

// Checked before any DB writes so a bot flood costs nothing more than a single
// count() query per request. Returns a response to short-circuit the request,
// or null if it should proceed.
export async function checkSpamGuards(body: unknown, ipAddress: string): Promise<NextResponse | null> {
  if (
    body &&
    typeof body === "object" &&
    HONEYPOT_FIELD in body &&
    (body as Record<string, unknown>)[HONEYPOT_FIELD]
  ) {
    // A hidden field real users never see or fill in — only bots that blindly
    // fill every field trip this. Respond like an ordinary validation failure
    // rather than revealing it was caught.
    return NextResponse.json({ error: { message: "Something went wrong. Please try again." } }, { status: 400 });
  }

  if (ipAddress !== "unknown") {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
    const recentCount = await db.consentRecord.count({
      where: { ipAddress, acceptedAt: { gte: windowStart } },
    });
    if (recentCount >= RATE_LIMIT_MAX_SUBMISSIONS) {
      return NextResponse.json(
        { error: { message: "Too many submissions from this connection. Please try again in a little while." } },
        { status: 429 }
      );
    }
  }

  return null;
}
