import { NextResponse } from "next/server";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { hashPassword } from "@/lib/auth";
import type { VendorApplication } from "@/types/domain";

function checkPassword(req: Request): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${password}`;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!checkPassword(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, notes } = body as { status: VendorApplication["status"]; notes: string | null };
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    const updated = await vendorRepo.updateStatus(params.id, status, notes ?? null, "admin");
    let generatedPassword: string | null = null;

    if (updated.userId && ["approved", "rejected"].includes(status)) {
      try {
        const user = await userRepo.get(updated.userId);
        if (user && !user.passwordHash && status === "approved") {
          generatedPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
          await userRepo.update(user.id, { passwordHash: hashPassword(generatedPassword) });
        }
      } catch (userErr) {
        console.error("[admin/vendor] failed to ensure user password", userErr);
      }
    }

    if (updated.profileId && ["approved", "rejected"].includes(status)) {
      try {
        await vendorProfileRepo.update(updated.profileId, { status });
      } catch (profileErr) {
        console.error("[admin/vendor] failed to update profile status", profileErr);
      }
    }

    return NextResponse.json({ application: updated, generatedPassword });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
