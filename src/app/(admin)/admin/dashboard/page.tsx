import { signOut } from "@/lib/auth";

export default function AdminDashboard() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Admin console</h1>
      <p className="mt-2 text-neutral-600 dark:text-neutral-400">
        Lead/partner/fee management placeholder — see docs/ARCHITECTURE.md
        FR-11 for the scope of this console.
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="mt-6"
      >
        <button
          type="submit"
          className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
