import { NextResponse } from "next/server";
import { requireAdmin, hashPassword } from "@/lib/auth";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { isLocalMode } from "@/lib/db/repositories/utils";
import { localStore } from "@/lib/db/localStore";
import type { AdminRole } from "@/types/admin";

async function deleteByField(collection: string, field: string, value: string) {
  if (isLocalMode()) {
    const all = await localStore.all<any>(collection);
    for (const item of all) {
      if (item[field] === value) {
        await localStore.delete(collection, item.id);
      }
    }
    return;
  }
  const { getDb } = await import("@/lib/db/firebase");
  const col = getDb().collection(collection);
  const snap = await col.where(field, "==", value).get();
  const batch = getDb().batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function deleteDoc(collection: string, id: string) {
  if (isLocalMode()) {
    await localStore.delete(collection, id);
    return;
  }
  const { getDb } = await import("@/lib/db/firebase");
  await getDb().collection(collection).doc(id).delete();
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin("superadmin");
    const body = await req.json();
    const { firstName, lastName, email, phone, address, role, adminRole, password } = body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      address?: string;
      role?: string;
      adminRole?: AdminRole;
      password?: string;
    };

    const user = await userRepo.get(params.id);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (email !== undefined) updates.email = email.toLowerCase();
    if (phone !== undefined) updates.phone = phone || null;
    if (address !== undefined) updates.address = address || null;
    if (role !== undefined && ["couple", "vendor", "admin"].includes(role)) updates.role = role;
    if (adminRole !== undefined && ["commercial", "support", "moderator", "superadmin"].includes(adminRole)) {
      updates.adminRole = adminRole;
    }
    if (password && typeof password === "string" && password.length >= 8) {
      updates.passwordHash = hashPassword(password);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Aucune modification fournie" }, { status: 400 });
    }

    const updated = await userRepo.update(params.id, updates);
    console.log(`[admin/users] User ${params.id} updated by admin ${admin.id}`, Object.keys(updates));

    return NextResponse.json({
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        adminRole: updated.adminRole,
        phone: updated.phone,
        address: updated.address,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin("superadmin");
    const userId = params.id;

    const user = await userRepo.get(userId);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }
    if (user.role === "admin") {
      return NextResponse.json({ error: "Impossible de supprimer un compte administrateur" }, { status: 400 });
    }

    const collectionsToCleanByUserId = [
      "messages",
      "notifications",
      "sessions",
      "leads",
      "shares",
      "events",
      "credit_transactions",
      "timeline_tasks",
      "witnesses",
      "wedding_expenses",
      "proposals",
    ];

    // Delete vendor-specific data
    if (user.role === "vendor") {
      // Delete vendor profile
      const profile = await vendorProfileRepo.getByUserId(userId).catch(() => null);
      if (profile) {
        await deleteDoc("vendor_profiles", profile.id).catch(() => {});
      }
      // Delete vendor application
      try {
        const apps = await vendorRepo.list();
        for (const app of apps) {
          if (app.userId === userId) {
            await deleteDoc("vendor_applications", app.id).catch(() => {});
          }
        }
      } catch {}
      // Delete matches by vendor
      try { await deleteByField("project_vendor_matches", "vendorId", userId); } catch {}
    }

    // Delete couple-specific data
    if (user.role === "couple") {
      // Delete couple profile
      const profile = await coupleProfileRepo.getByUserId(userId).catch(() => null);
      if (profile) {
        await deleteDoc("couple_profiles", profile.id).catch(() => {});
      }
      // Delete projects and their related data
      try {
        const projects = await projectRepo.listByUser(userId);
        for (const proj of projects) {
          // Delete matches for this project
          try { await matchRepo.deleteByProject(proj.id).catch(() => {}); } catch {}
          // Delete tenders for this project
          try { await deleteByField("tenders", "projectId", proj.id); } catch {}
          // Delete the project
          await projectRepo.delete(proj.id).catch(() => {});
        }
      } catch {}
    }

    // Delete common data by userId
    for (const col of collectionsToCleanByUserId) {
      try { await deleteByField(col, "userId", userId); } catch {}
    }

    // Finally delete the user account
    await deleteDoc("users", userId);

    console.log(`[admin/users] User ${userId} (${user.email}) deleted by admin ${admin.id}`);
    return NextResponse.json({ ok: true, message: "Utilisateur et toutes ses données supprimés définitivement" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
