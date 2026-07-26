import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Returns the logged-in user's id, or null if not authenticated. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as any)?.id;
  return id ?? null;
}
