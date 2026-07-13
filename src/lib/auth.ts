import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// Session strategy: JWT, not database.
//
// Auth.js does not support database-backed sessions with the Credentials
// provider — database sessions rely on the adapter's Account-linking flow,
// which Credentials sign-in never creates. Configuring `strategy: "database"`
// here silently issued a JWT-shaped cookie that could never be validated
// against the Session table, so every credentials sign-in looked successful
// but the resulting session was never recognized on the next request. This
// was the actual root cause of a long-running "login doesn't work" report —
// switching to JWT sessions is the correct, Auth.js-documented approach for
// Credentials-based auth, not a workaround.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "ReferWise <onboarding@resend.dev>",
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as typeof session.user.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
