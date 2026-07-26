import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

// Default subjects + teachers seeded for every new user on first sign-in.
// Edit this list to change what a brand-new account starts with.
const DEFAULT_SUBJECTS = [
  { name: "كيمياء", teachers: ["محمد كمال", "خالد صقر"] },
  { name: "عربي", teachers: ["محمد صلاح", "صلاح الرفاعي"] },
  { name: "فيزياء", teachers: ["محمد رشدي", "محمد عبدالمعبود"] },
  { name: "انجليزي", teachers: ["أنيس", "انجلشاوي"] },
  { name: "أحياء", teachers: ["الجوهري", "أحمد عياد"] },
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login?check=1",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    EmailProvider({
      // Works with any SMTP server. Resend's SMTP endpoint is the easiest
      // option to use on Vercel — see README for exact values.
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  events: {
    async createUser({ user }) {
      // Seed default subjects/teachers so a brand-new account isn't empty.
      for (let i = 0; i < DEFAULT_SUBJECTS.length; i++) {
        const s = DEFAULT_SUBJECTS[i];
        await prisma.subject.create({
          data: {
            userId: user.id,
            name: s.name,
            order: i,
            teachers: { create: s.teachers.map((name) => ({ name })) },
          },
        });
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).avatar = (user as any).avatar;
        (session.user as any).points = (user as any).points;
      }
      return session;
    },
  },
};
