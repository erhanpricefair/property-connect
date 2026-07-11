import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
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
        <input type="hidden" name="redirectTo" value="/admin/dashboard" />
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
