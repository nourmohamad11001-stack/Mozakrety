import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ todos });
}

// POST { subjectId, teacher, text, dueDate } -> create a new todo
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { subjectId, teacher, text, dueDate } = await req.json();
  if (!subjectId || !teacher || !text?.trim() || !dueDate) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const todo = await prisma.todo.create({
    data: { userId, subjectId, teacher, text: text.trim(), dueDate },
  });
  return NextResponse.json({ todo });
}

// PATCH { id, done } -> toggle / set completion state
export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id, done } = await req.json();
  const existing = await prisma.todo.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const todo = await prisma.todo.update({ where: { id }, data: { done } });
  return NextResponse.json({ todo });
}

// DELETE { id }
export async function DELETE(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const existing = await prisma.todo.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  await prisma.todo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
