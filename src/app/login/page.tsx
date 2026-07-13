import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/lib/auth";

// This page checks the current session on every request and must never be
// served from a cache — otherwise a signed-in user can be shown a stale,
// pre-login version of this page instead of being redirected to the
// dashboard.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Only redirect away if the session has a recognized role — a stale or
  // malformed token (e.g. from a session issued under a previous auth
  // config) must fall through to the sign-in form, not bounce forever
  // against a downstream page that also redirects unrecognized roles back
  // here. This is what actually broke in production: a leftover cookie
  // with no role attached created an infinite /login <-> /admin/dashboard
  // loop (ERR_TOO_MANY_REDIRECTS).
  const session = await auth();
  if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPPORT_ADMIN") {
    redirect("/admin/dashboard");
  }
  if (session?.user?.role === "PARTNER") {
    redirect("/partner/dashboard");
  }

  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      {params?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Invalid email or password. Please try again.
        </p>
      )}

      <form
        action={async (formData) => {
          "use server";
          try {
            await signIn("credentials", formData);
          } catch (error) {
            if (error instanceof AuthError) {
              redirect("/login?error=CredentialsSignin");
            }
            throw error;
          }
        }}
        className="flex flex-col gap-3"
      >
        <p className="text-sm font-medium text-neutral-500">Partner / Admin</p>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <input type="hidden" name="redirectTo" value="/dashboard" />
        <button
          type="submit"
          className="rounded bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900"
        >
          Sign in
        </button>
      </form>

      <form
        action={async (formData) => {
          "use server";
          await signIn("resend", formData);
        }}
        className="flex flex-col gap-3 border-t border-neutral-200 pt-6 dark:border-neutral-800"
      >
        <p className="text-sm font-medium text-neutral-500">Consumer magic link</p>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700"
        >
          Send magic link
        </button>
      </form>
    </main>
  );
}
