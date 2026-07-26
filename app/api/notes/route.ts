import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

// GET ?subjectId=xxx -> returns that subject's note (or all notes if no query)
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");

  if (subjectId) {
    const note = await prisma.note.findUnique({ where: { userId_subjectId: { userId, subjectId } } });
    return NextResponse.json({ note });
  }
  const notes = await prisma.note.findMany({ where: { userId } });
  return NextResponse.json({ notes });
}

// PUT { subjectId, content } -> upsert the note for that subject
export async function PUT(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { subjectId, content } = await req.json();
  if (!subjectId) return NextResponse.json({ error: "subjectId required" }, { status: 400 });

  const note = await prisma.note.upsert({
    where: { userId_subjectId: { userId, subjectId } },
    update: { content: content ?? "" },
    create: { userId, subjectId, content: content ?? "" },
  });
  return NextResponse.json({ note });
}
