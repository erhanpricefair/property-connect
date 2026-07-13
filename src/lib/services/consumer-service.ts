import { db } from "@/lib/db";

// A returning consumer is matched by email or phone. Their name/email/phone
// are kept in sync with the latest submission rather than frozen at
// whichever value was entered the first time that email/phone was used —
// otherwise notification emails greet them with a stale name.
export async function findOrCreateConsumer(email: string, phone: string, name: string) {
  const existing = await db.consumer.findFirst({ where: { OR: [{ email }, { phone }] } });

  if (!existing) {
    return db.consumer.create({ data: { email, phone, name } });
  }

  if (existing.name !== name || existing.email !== email || existing.phone !== phone) {
    return db.consumer.update({ where: { id: existing.id }, data: { name, email, phone } });
  }

  return existing;
}
