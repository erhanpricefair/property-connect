import Link from "next/link";
import { ConsumerHeader } from "@/components/marketing/consumer-header";

const display = "font-[family-name:var(--font-fraunces)]";

export const metadata = {
  title: "Privacy policy — ReferWise",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F3EFE6] font-[family-name:var(--font-work-sans)] text-[#16201B]">
      <ConsumerHeader />
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className={`${display} text-4xl tracking-tight`}>Privacy policy</h1>
        <p className="mt-3 text-sm text-[#16201B]/50">Last updated 13 July 2026.</p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-relaxed text-[#16201B]/80">
          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>What this covers</h2>
            <p className="mt-2">
              ReferWise (&quot;we&quot;, &quot;us&quot;) connects people looking for property services in
              Melbourne with one matched local professional — a real estate agent, mortgage broker,
              conveyancer, building inspector, or property manager. This policy explains what we collect
              when you use one of our forms, why, and what happens to it.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>What we collect</h2>
            <p className="mt-2">Depending on which form you submit, this can include:</p>
            <ul className="mt-2 list-disc pl-5">
              <li>Your name, email address, and phone number</li>
              <li>The property address and suburb involved</li>
              <li>Details about your situation — e.g. property type, timeframe, or current status</li>
              <li>
                For finance enquiries only: purchase price, deposit amount, and income (as an exact
                figure or a band, your choice)
              </li>
            </ul>
            <p className="mt-2">
              We also automatically record the IP address a submission came from and a timestamp, for
              fraud prevention and to keep an audit record of your consent.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>Why we collect it</h2>
            <p className="mt-2">
              To match you with one suitable professional covering your suburb, and to let them contact
              you directly about your enquiry. Finance details are collected only with a separate,
              explicit consent — distinct from general contact consent — because of the sensitivity of
              financial information.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>Who we share it with</h2>
            <p className="mt-2">
              Your details are shared with exactly <strong>one</strong> matched professional per enquiry
              — never sold, never broadcast to a list, and never used to generate competing offers for
              your contact details. We don&apos;t share your information with anyone else except where
              required by law.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>Where it&apos;s stored</h2>
            <p className="mt-2">
              Your data is stored in a database hosted in Australia (Sydney) and is only accessible to
              ReferWise staff and the specific professional you&apos;re matched with.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>Your rights</h2>
            <p className="mt-2">
              You can ask us what information we hold about you, ask us to correct it, or ask us to
              delete it, at any time. Contact us using the details below and we&apos;ll respond within a
              reasonable time.
            </p>
          </section>

          <section>
            <h2 className={`${display} text-xl text-[#16201B]`}>Contact</h2>
            <p className="mt-2">
              Questions about this policy or your data? Reach us via the contact details on our{" "}
              <Link href="/" className="underline hover:text-[#1F4A3C]">
                homepage
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
