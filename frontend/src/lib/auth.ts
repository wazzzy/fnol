import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export type UserRole = "claimant" | "adjuster" | "manager" | "cxo";

interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Prototype users — replace with DB lookup in production
const USERS: AppUser[] = [
  {
    id: "1",
    name: "Alice Claimant",
    email: "claimant@fnol.dev",
    password: "claimant123",
    role: "claimant",
  },
  {
    id: "2",
    name: "Bob Adjuster",
    email: "adjuster@fnol.dev",
    password: "adjuster123",
    role: "adjuster",
  },
  {
    id: "3",
    name: "Carol Manager",
    email: "manager@fnol.dev",
    password: "manager123",
    role: "manager",
  },
  {
    id: "4",
    name: "David CXO",
    email: "cxo@fnol.dev",
    password: "cxo123",
    role: "cxo",
  },
];

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as AppUser).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as AppUser).role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

declare module "next-auth" {
  interface User {
    role: UserRole;
  }
  interface Session {
    user: User & {
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
  }
}
