import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@nextpress/db';
import bcrypt from 'bcryptjs';

const nextAuth = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token['role'] = (user as { role: string }).role;
        token['id'] = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { role: string }).role = token['role'] as string;
        (session.user as unknown as { id: string }).id = token['id'] as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
});

// Cast to any to avoid non-portable type references from next-auth internals
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _auth = nextAuth as any;
export const handlers = _auth.handlers;
export const auth = _auth.auth;
export const signIn = _auth.signIn;
export const signOut = _auth.signOut;
