import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { adminRepo } from "@/lib/db/repositories/adminRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";

export async function GET() {
  try {
    await requireAdmin();
    const subs = await adminRepo.listUserSubscriptions();
    const users = await Promise.all(subs.map((s) => userRepo.get(s.userId).catch(() => null)));
    return NextResponse.json({
      subscriptions: subs.map((s, i) => ({
        ...s,
        user: users[i] ? { id: users[i]!.id, email: users[i]!.email, firstName: users[i]!.firstName, lastName: users[i]!.lastName } : null,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
