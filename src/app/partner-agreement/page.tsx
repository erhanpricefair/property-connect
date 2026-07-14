import type { Metadata } from "next";
import Link from "next/link";
import { ConsumerHeader } from "@/components/marketing/consumer-header";

const display = "font-[family-name:var(--font-fraunces)]";

export const metadata: Metadata = {
  title: "Partner Referral Agreement",
  description: "The terms ReferWise partners agree to when accepting referred leads.",
};

const FEE_ROWS: Array<{ type: string; fee: string; trigger: string }> = [
  { type: "Sell", fee: "$1,500", trigger: "Sale settles" },
  { type: "Buy", fee: "$1,500", trigger: "Purchase settles" },
  { type: "Finance", fee: "$600", trigger: "Loan settles / drawdown" },
  { type: "Conveyancing", fee: "$200", trigger: "Matter completed" },
  { type: "Building inspection", fee: "$100", trigger: "Inspection completed" },
  { type: "Property management", fee: "$250", trigger: "Management agreement signed" },
];

export default function PartnerAgreementPage() {
  return (
    <div className="min-h-screen bg-[#F3EFE6] font-[family-name:var(--font-work-sans)] text-[#16201B]">
      <ConsumerHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className={`${display} text-4xl tracking-tight`}>Partner Referral Agreement</h1>
        <p className="mt-3 text-sm text-[#16201B]/50">Version 1.0 — 14 July 2026</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-[#16201B]/80">
          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>1. What this covers</h2>
            <p className="mt-2">
              This agreement sets out the terms on which ReferWise refers prospective clients
              (&quot;Leads&quot;) to you (&quot;Partner&quot;) in exchange for a referral fee when a
              referred Lead converts into paid work. It applies from the date you accept your first
              Lead assignment and continues until either party ends it under section 8.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>2. What ReferWise provides</h2>
            <p className="mt-2">
              ReferWise refers each Lead to <strong>one</strong> Partner at a time — never broadcast to
              a list, never sold to multiple businesses at once. Leads are matched to your registered
              service type and, where relevant, your coverage area. ReferWise does not guarantee any
              minimum number of Leads, that a Lead will respond, or that a Lead will convert into paid
              work.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>3. Responding to a Lead</h2>
            <p className="mt-2">
              When a Lead is assigned to you, you have until the stated deadline to accept or decline it
              — <strong>24 hours</strong> for Sell, Buy, and Other Services leads, <strong>4 hours</strong>{" "}
              for Finance leads (finance leads carry tighter contract-clause deadlines). If you neither
              accept nor decline in time, the Lead may be reassigned to another Partner. Declining a Lead
              carries no penalty — you&apos;re never obligated to take on work that isn&apos;t a good fit.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>4. Referral fee</h2>
            <p className="mt-2">
              If you accept a Lead and it converts into completed work, a referral fee is payable to
              ReferWise as set out below (amounts exclude GST; 10% GST is added at invoicing). These are
              ReferWise&apos;s standard rates — if a different rate has been agreed with you in writing,
              that rate applies instead.
            </p>
            <div className="mt-4 overflow-x-auto rounded border border-[#16201B]/15">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#16201B]/15 bg-[#EBE6D9] text-left">
                    <th className="px-3 py-2 font-medium">Lead type</th>
                    <th className="px-3 py-2 font-medium">Fee</th>
                    <th className="px-3 py-2 font-medium">Payable when</th>
                  </tr>
                </thead>
                <tbody>
                  {FEE_ROWS.map((row) => (
                    <tr key={row.type} className="border-b border-[#16201B]/10 last:border-0">
                      <td className="px-3 py-2">{row.type}</td>
                      <td className="px-3 py-2">{row.fee}</td>
                      <td className="px-3 py-2 text-[#16201B]/60">{row.trigger}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[#16201B]/60">
              The fee is charged only once the outcome above actually happens — not on acceptance, and
              not on an unconditional or in-progress deal that later falls through.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>5. Reporting outcomes</h2>
            <p className="mt-2">
              You agree to keep the Lead&apos;s status up to date in your partner dashboard as things
              progress, and to promptly report the final outcome — won, lost, or no outcome — so the
              referral fee (if any) can be correctly invoiced. ReferWise may follow up directly with you
              or the consumer to confirm an outcome.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>6. Invoicing and payment</h2>
            <p className="mt-2">
              ReferWise will invoice you once a Lead&apos;s outcome is confirmed. Payment is due within{" "}
              <strong>14 days</strong> of the invoice date via bank transfer. If a deal that was invoiced
              later falls through before completion, ReferWise will issue a corrected invoice or credit.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>7. Your obligations</h2>
            <ul className="mt-2 list-disc pl-5">
              <li>Hold any licence, registration, or professional membership required to perform the work you&apos;re referred for, and keep it current</li>
              <li>Contact referred consumers promptly and professionally</li>
              <li>Use a referred consumer&apos;s details only for the purpose of the referral — not for unrelated marketing, and not shared with a third party without the consumer&apos;s consent</li>
              <li>Not re-refer a Lead to another business without ReferWise&apos;s agreement</li>
            </ul>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>8. Ending this agreement</h2>
            <p className="mt-2">
              Either party may end this agreement at any time with 14 days&apos; written notice (email is
              sufficient). Ending the agreement doesn&apos;t cancel a referral fee already owed for a Lead
              accepted before the notice was given.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>9. Relationship</h2>
            <p className="mt-2">
              You engage with referred consumers as an independent business, not as an employee, agent,
              or representative of ReferWise. ReferWise isn&apos;t responsible for the advice, service,
              or conduct you provide, and doesn&apos;t guarantee the accuracy of information a consumer
              submits.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>10. Governing law</h2>
            <p className="mt-2">This agreement is governed by the law of Victoria, Australia.</p>
          </section>

          <section className="rounded border border-[#16201B]/15 bg-[#EBE6D9] p-4">
            <p>
              Questions about this agreement? Reach us via the contact details on our{" "}
              <Link href="/" className="underline hover:text-[#1F4A3C]">
                homepage
              </Link>
              . See also our{" "}
              <Link href="/privacy" className="underline hover:text-[#1F4A3C]">
                privacy policy
              </Link>{" "}
              for how consumer data is handled.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
