import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { db } from './db';

// #region agent log
if (typeof window === 'undefined') {
  const logEndpoint = 'http://127.0.0.1:7242/ingest/4522d9df-bdad-4563-bb43-9ffb355963c3';
  fetch(logEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'debug-session', runId: 'startup', hypothesisId: 'H4', location: 'lib/auth.ts:8', message: 'auth.ts module loading', data: { hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET, hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID, hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET }, timestamp: Date.now() }) }).catch(() => {});
}
// #endregion

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findByEmail(credentials.email);
        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        // Handle Google sign-in
        const existingUser = await db.user.findByEmail(user.email!);
        if (!existingUser) {
          await db.user.create({
            email: user.email!,
            name: user.name || undefined,
            image: user.image || undefined,
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const user = await db.user.findByEmail(session.user.email);
        if (user) {
          (session.user as any).id = user.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

