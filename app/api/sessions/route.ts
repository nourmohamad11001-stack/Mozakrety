import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const sessions = await prisma.studySession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  return NextResponse.json({ sessions });
}

// POST { subjectId, teacher, minutes } -> logs a completed study session
// and awards `minutes` points to the user in the same transaction.
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { subjectId, teacher, minutes } = await req.json();
  if (!subjectId || !teacher || !minutes || minutes <= 0) {
    return NextResponse.json({ error: "subjectId, teacher, and minutes are required" }, { status: 400 });
  }

  const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId } });
  if (!subject) return NextResponse.json({ error: "subject not found" }, { status: 404 });

  const [session, user] = await prisma.$transaction([
    prisma.studySession.create({
      data: { userId, subjectId, teacher, minutes: Math.round(minutes) },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { points: { increment: Math.round(minutes) } },
    }),
  ]);

  return NextResponse.json({ session, points: user.points });
}
