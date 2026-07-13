import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Melbourne launch
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">PropertyConnect</h1>
      <p className="max-w-md text-muted-foreground">
        Get connected with a trusted local agent, broker, or property professional —
        no cost, no obligation.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/sell">Sell a property</Link>
        </Button>
        <Button asChild>
          <Link href="/buy">Buy a property</Link>
        </Button>
        <Button asChild>
          <Link href="/finance">Get finance</Link>
        </Button>
        <Button asChild>
          <Link href="/other-services">Other services</Link>
        </Button>
      </div>
      <Button variant="outline" asChild className="mt-2">
        <Link href="/login">Partner / admin sign in</Link>
      </Button>
    </main>
  );
}
