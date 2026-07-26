import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const subjects = await prisma.subject.findMany({
    where: { userId },
    orderBy: { order: "asc" },
    include: { teachers: true },
  });
  return NextResponse.json({ subjects });
}
