import Link from "next/link";

export function ConsumerHeader() {
  return (
    <header className="border-b border-[#16201B]/10 bg-[#F3EFE6]">
      <div className="mx-auto max-w-2xl px-6 py-6">
        <Link href="/" className="font-[family-name:var(--font-fraunces)] text-lg tracking-tight text-[#16201B]">
          Property<span className="text-[#B08A4E]">Connect</span>
        </Link>
      </div>
    </header>
  );
}
