import Link from "next/link";
import { Home, Landmark, FileCheck2, ClipboardCheck, KeyRound } from "lucide-react";
import { TerraceSkyline } from "@/components/marketing/terrace-skyline";
import { IntroductionPath } from "@/components/marketing/introduction-path";
import { TestimonialCarousel } from "@/components/marketing/testimonial-carousel";
import { TESTIMONIALS } from "@/lib/testimonials";

const display = "font-[family-name:var(--font-fraunces)]";
const body = "font-[family-name:var(--font-work-sans)]";
const mono = "font-[family-name:var(--font-plex-mono)]";

const PATHWAYS = [
  { href: "/sell", label: "Sell" },
  { href: "/buy", label: "Buy" },
  { href: "/finance", label: "Finance" },
  { href: "/other-services", label: "Other services" },
];

const STEPS = [
  {
    title: "Tell us what you need",
    body: "A two-minute form: your situation, your suburb, and how to reach you.",
  },
  {
    title: "We match you",
    body: "Same day, with one professional who actually covers your area — not a list of ten.",
  },
  {
    title: "They reach out to you",
    body: "Directly. No call centre, and no bidding war for your contact details.",
  },
];

const PROFESSIONALS = [
  { icon: Home, title: "Real estate agents", body: "Selling or leasing, matched to your suburb." },
  { icon: Landmark, title: "Mortgage brokers", body: "Finance sorted before settlement day arrives." },
  { icon: FileCheck2, title: "Conveyancers", body: "Contracts and settlement, handled properly." },
  { icon: ClipboardCheck, title: "Building inspectors", body: "Know what you're buying, before you buy it." },
  { icon: KeyRound, title: "Property managers", body: "Someone local, looking after your investment." },
];

const REASONS = [
  { title: "Free for you", body: "Professionals pay for the introduction. You never do." },
  { title: "Vetted, local", body: "Every match covers your specific suburb, not just “Melbourne.”" },
  { title: "One point of contact", body: "Your details go to one professional — never ten." },
];

export default function MarketingHome() {
  return (
    <main className={`${body} bg-[#F3EFE6] text-[#16201B]`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <span className={`${display} text-lg tracking-tight`}>
          Property<span className="text-[#B08A4E]">Connect</span>
        </span>
        <Link
          href="/login"
          className={`${mono} text-[11px] uppercase tracking-[0.15em] text-[#16201B]/60 transition hover:text-[#16201B]`}
        >
          Partner / admin sign in
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-8 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8 lg:pb-28">
        <div>
          <p className={`${mono} text-[11px] uppercase tracking-[0.2em] text-[#B08A4E]`}>
            Melbourne · Property introductions
          </p>
          <h1 className={`${display} mt-5 text-5xl leading-[1.05] tracking-tight sm:text-6xl`}>
            The right introduction,
            <br />
            made fast.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-[#16201B]/70">
            Selling, buying, finance, or a trusted specialist — tell us what you need and
            we&apos;ll connect you with one vetted local professional. Free, obligation-free,
            no chasing.
          </p>

          <nav
            aria-label="Get started"
            className="mt-9 flex flex-wrap overflow-hidden rounded-sm border border-[#16201B]/15"
          >
            {PATHWAYS.map((pathway, i) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className={`${mono} flex-1 whitespace-nowrap border-[#16201B]/15 px-5 py-3.5 text-center text-[11px] uppercase tracking-[0.06em] text-[#16201B] transition hover:bg-[#1F4A3C] hover:text-[#F3EFE6] ${
                  i > 0 ? "border-l" : ""
                }`}
              >
                {pathway.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="rounded-sm border border-[#16201B]/15 bg-[#EBE6D9] p-8">
          <TerraceSkyline className="h-auto w-full text-[#1F4A3C]" />
          <p className={`${mono} mt-4 text-[10px] uppercase tracking-[0.15em] text-[#16201B]/45`}>
            Terrace rooflines, Melbourne
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#16201B] text-[#F3EFE6]">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
          <p className={`${mono} text-[11px] uppercase tracking-[0.2em] text-[#B08A4E]`}>How it works</p>
          <div className="relative mt-12 grid gap-16 pl-14 sm:pl-16">
            <IntroductionPath className="absolute left-0 top-0 h-full w-10 text-[#B08A4E]" />
            {STEPS.map((step) => (
              <div key={step.title}>
                <h3 className={`${display} text-2xl sm:text-3xl`}>{step.title}</h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-[#F3EFE6]/65">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we introduce you to */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <p className={`${mono} text-[11px] uppercase tracking-[0.2em] text-[#B08A4E]`}>
          Who we introduce you to
        </p>
        <h2 className={`${display} mt-4 max-w-lg text-3xl tracking-tight sm:text-4xl`}>
          Five kinds of local expertise, one form away.
        </h2>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
          {PROFESSIONALS.map(({ icon: Icon, title, body: desc }) => (
            <div key={title} className="border-t border-[#16201B]/15 pt-5">
              <Icon className="h-5 w-5 text-[#1F4A3C]" strokeWidth={1.5} />
              <h3 className={`${display} mt-4 text-xl`}>{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#16201B]/65">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {TESTIMONIALS.length > 0 ? (
        <TestimonialCarousel testimonials={TESTIMONIALS} />
      ) : (
        /* Launch band — replaced by the testimonial carousel once genuine
           reviews exist. Every claim here is a process commitment, not a
           track-record claim. */
        <section className="border-y border-[#16201B]/10 bg-[#EBE6D9]">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
            <p className={`${mono} text-[11px] uppercase tracking-[0.2em] text-[#B08A4E]`}>
              Newly launched
            </p>
            <h2 className={`${display} mt-4 max-w-2xl text-3xl leading-snug tracking-tight sm:text-4xl`}>
              We&apos;re new in Melbourne — and holding ourselves to a simple standard.
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <p className="max-w-xs text-sm leading-relaxed text-[#16201B]/70">
                Every professional is licence-checked before they receive a single introduction.
              </p>
              <p className="max-w-xs text-sm leading-relaxed text-[#16201B]/70">
                Matches are made at suburb level, by someone who actually covers your area.
              </p>
              <p className="max-w-xs text-sm leading-relaxed text-[#16201B]/70">
                Be among our first — we&apos;ll ask you how it went, and publish what you tell us.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Why PropertyConnect */}
      <section className="bg-[#1F4A3C] text-[#F3EFE6]">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 sm:grid-cols-3 sm:px-10">
          {REASONS.map((reason) => (
            <div key={reason.title}>
              <h3 className={`${display} text-2xl`}>{reason.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#F3EFE6]/70">{reason.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#B08A4E]/30 bg-[#16201B] text-[#F3EFE6]/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <span className={`${display} text-base text-[#F3EFE6]`}>
              Property<span className="text-[#B08A4E]">Connect</span>
            </span>
            <p className={`${mono} mt-2 text-[10px] uppercase tracking-[0.15em]`}>Melbourne launch</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {PATHWAYS.map((pathway) => (
              <Link key={pathway.href} href={pathway.href} className="transition hover:text-[#F3EFE6]">
                {pathway.label}
              </Link>
            ))}
            <Link href="/login" className="transition hover:text-[#F3EFE6]">
              Partner / admin sign in
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
