import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { PartnerType } from "@prisma/client";

// Words chosen to be unambiguous read aloud over the phone (no 0/O, 1/I/l
// confusion) — admin hands this to a newly onboarded partner directly.
const PASSWORD_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generateTempPassword(length = 12): string {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length]).join("");
}

export async function createPartner(params: {
  type: PartnerType;
  businessName: string;
  abn: string;
  contactName: string;
  email: string;
  phone?: string;
}) {
  const existing = await db.user.findUnique({ where: { email: params.email } });
  if (existing) {
    throw new Error("A user with this email already exists");
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await db.user.create({
    data: {
      email: params.email,
      phone: params.phone || undefined,
      name: params.contactName,
      passwordHash,
      role: "PARTNER",
    },
  });

  const partner = await db.partner.create({
    data: {
      userId: user.id,
      type: params.type,
      businessName: params.businessName,
      abn: params.abn,
      licenseStatus: "PENDING",
      active: true,
    },
  });

  return { user, partner, tempPassword };
}
