import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

// POST { subjectId, name } -> add a teacher to a subject the user owns
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { subjectId, name } = await req.json();
  if (!subjectId || !name?.trim()) {
    return NextResponse.json({ error: "subjectId and name are required" }, { status: 400 });
  }

  const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId } });
  if (!subject) return NextResponse.json({ error: "subject not found" }, { status: 404 });

  const teacher = await prisma.teacher.create({
    data: { subjectId, name: name.trim() },
  });
  return NextResponse.json({ teacher });
}

// DELETE { teacherId } -> remove a teacher (keeps at least one per subject)
export async function DELETE(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { teacherId } = await req.json();
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: { subject: true },
  });
  if (!teacher || teacher.subject.userId !== userId) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const count = await prisma.teacher.count({ where: { subjectId: teacher.subjectId } });
  if (count <= 1) {
    return NextResponse.json({ error: "لازم يفضل مدرس واحد على الأقل" }, { status: 400 });
  }

  await prisma.teacher.delete({ where: { id: teacherId } });
  return NextResponse.json({ ok: true });
}
