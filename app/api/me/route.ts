import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ user });
}

// PATCH { name?, avatar? } -> update profile fields
export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { name, avatar } = await req.json();
  const data: Record<string, string> = {};
  if (name?.trim()) data.name = name.trim();
  if (avatar) data.avatar = avatar;

  const user = await prisma.user.update({ where: { id: userId }, data });
  return NextResponse.json({ user });
}
