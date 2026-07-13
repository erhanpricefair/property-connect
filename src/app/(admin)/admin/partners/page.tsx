import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPartner } from "@/lib/services/partner-service";
import type { PartnerType } from "@prisma/client";

const PARTNER_TYPE_VALUES: PartnerType[] = ["AGENT", "MORTGAGE_BROKER", "INSPECTOR", "CONVEYANCER"];
const ABN_REGEX = /^\d{11}$/;

async function createPartnerFromForm(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT_ADMIN")) {
    return;
  }

  const type = formData.get("type");
  const businessName = formData.get("businessName");
  const abnRaw = formData.get("abn");
  const contactName = formData.get("contactName");
  const email = formData.get("email");
  const phone = formData.get("phone");

  if (
    typeof type !== "string" ||
    !PARTNER_TYPE_VALUES.includes(type as PartnerType) ||
    typeof businessName !== "string" ||
    !businessName.trim() ||
    typeof abnRaw !== "string" ||
    typeof contactName !== "string" ||
    !contactName.trim() ||
    typeof email !== "string" ||
    !email.trim()
  ) {
    redirect("/admin/partners?error=Please+fill+in+all+required+fields");
  }

  const abn = abnRaw.replace(/\s/g, "");
  if (!ABN_REGEX.test(abn)) {
    redirect("/admin/partners?error=ABN+must+be+11+digits");
  }

  let result: Awaited<ReturnType<typeof createPartner>>;
  try {
    result = await createPartner({
      type: type as PartnerType,
      businessName: businessName.trim(),
      abn,
      contactName: contactName.trim(),
      email: email.trim(),
      phone: typeof phone === "string" ? phone.trim() : undefined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    redirect(`/admin/partners?error=${encodeURIComponent(message)}`);
  }

  redirect(
    `/admin/partners?created=${result.partner.id}&email=${encodeURIComponent(email.trim())}&tempPassword=${encodeURIComponent(result.tempPassword)}`
  );
}

export default async function AdminPartnersPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; email?: string; tempPassword?: string; error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const params = await searchParams;

  const partners = await db.partner.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <Link href="/admin/dashboard" className="text-sm text-neutral-500 underline">
        ← Back to leads
      </Link>

      <h1 className="mt-4 text-2xl font-semibold">Partners</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Professionals who can be assigned leads.
      </p>

      {params.created && params.tempPassword && (
        <div className="mt-6 rounded border border-green-300 bg-green-50 p-4 text-sm dark:border-green-800 dark:bg-green-950">
          <p className="font-medium">Partner created.</p>
          <p className="mt-1">
            Give them these sign-in details directly — the password is shown only once and won&apos;t be
            recoverable after you leave this page:
          </p>
          <p className="mt-2 font-mono">
            Email: {params.email}
            <br />
            Temporary password: {params.tempPassword}
          </p>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            They sign in at <span className="font-mono">/login</span> using the Partner / Admin form.
          </p>
        </div>
      )}

      {params.error && (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {params.error}
        </div>
      )}

      <section className="mt-8 rounded border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Add a partner</h2>
        <form action={createPartnerFromForm} className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="type" className="text-xs text-neutral-500">
              Type
            </label>
            <select
              id="type"
              name="type"
              required
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              {PARTNER_TYPE_VALUES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="businessName" className="text-xs text-neutral-500">
              Business name
            </label>
            <input
              id="businessName"
              name="businessName"
              required
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="abn" className="text-xs text-neutral-500">
              ABN (11 digits)
            </label>
            <input
              id="abn"
              name="abn"
              required
              placeholder="12345678901"
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="contactName" className="text-xs text-neutral-500">
              Contact name
            </label>
            <input
              id="contactName"
              name="contactName"
              required
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs text-neutral-500">
              Email (used to sign in)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-xs text-neutral-500">
              Phone <span className="text-neutral-400">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className="rounded border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="rounded bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
            >
              Create partner
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {partners.length} partner{partners.length === 1 ? "" : "s"}
        </h2>
        <table className="mt-3 w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800">
              <th className="py-2 pr-4 font-medium">Business</th>
              <th className="py-2 pr-4 font-medium">Type</th>
              <th className="py-2 pr-4 font-medium">Contact</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id} className="border-b border-neutral-100 dark:border-neutral-900">
                <td className="py-2 pr-4">{partner.businessName}</td>
                <td className="py-2 pr-4">{partner.type}</td>
                <td className="py-2 pr-4">
                  {partner.user.name ?? "—"}
                  <br />
                  <span className="text-neutral-500">{partner.user.email}</span>
                </td>
                <td className="py-2 pr-4">{partner.licenseStatus}</td>
                <td className="py-2 pr-4">{partner.active ? "Yes" : "No"}</td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-neutral-500">
                  No partners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
