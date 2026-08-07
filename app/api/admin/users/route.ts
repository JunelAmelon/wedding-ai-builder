import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";

export async function GET() {
  try {
    await requireAdmin("superadmin");
    const users = await userRepo.list();
    // Enrich with profile info
    const enriched = await Promise.all(
      users.map(async (u) => {
        const profile = u.role === "vendor"
          ? await vendorProfileRepo.getByUserId(u.id).catch(() => null)
          : u.role === "couple"
            ? await coupleProfileRepo.getByUserId(u.id).catch(() => null)
            : null;
        return {
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          avatarUrl: u.avatarUrl,
          phone: u.phone,
          address: u.address,
          role: u.role,
          adminRole: u.adminRole || null,
          emailVerified: u.emailVerified,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          profile: profile ? {
            companyName: (profile as any).companyName ?? null,
            weddingDate: (profile as any).weddingDate ?? null,
            status: (profile as any).status ?? null,
            serviceCategory: (profile as any).serviceCategory ?? null,
          } : null,
        };
      })
    );
    // Sort: admins first, then by creation date desc
    enriched.sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return NextResponse.json({ users: enriched });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
