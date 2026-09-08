import { NextResponse } from "next/server";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { revalidateVendorMatches } from "@/lib/matching/engine";
import { sendEmail } from "@/lib/email/send";
import { vendorApprovedEmail, vendorRejectedEmail } from "@/lib/email/emails";
import type { VendorApplication } from "@/types/domain";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin("moderator");
    const body = await req.json();
    const { status, notes } = body as { status: VendorApplication["status"]; notes: string | null };
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }
    const updated = await vendorRepo.updateStatus(params.id, status, notes ?? null, admin.id);
    let generatedPassword: string | null = null;

    if (updated.userId && ["approved", "rejected"].includes(status)) {
      try {
        const user = await userRepo.get(updated.userId);
        if (user && !user.passwordHash && status === "approved") {
          generatedPassword = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase();
          await userRepo.update(user.id, {
            passwordHash: hashPassword(generatedPassword),
            emailVerified: true,
          });
        }

        // Send approval or rejection email
        if (user) {
          try {
            if (status === "approved") {
              const loginUrl = `${APP_URL}/login?role=vendor`;
              const { subject, html } = vendorApprovedEmail({
                firstName: user.firstName,
                lastName: user.lastName,
                companyName: updated.companyName,
                loginUrl,
                tempPassword: generatedPassword || undefined,
              });
              await sendEmail({ to: user.email, subject, html });
            } else if (status === "rejected") {
              const { subject, html } = vendorRejectedEmail({
                firstName: user.firstName,
                lastName: user.lastName,
              });
              await sendEmail({ to: user.email, subject, html });
            }
          } catch (emailErr) {
            console.error("[admin/vendor] Erreur envoi email:", emailErr);
          }
        }
      } catch (userErr) {
        console.error("[admin/vendor] failed to ensure user password", userErr);
      }
    }

    if (updated.profileId && ["approved", "rejected"].includes(status)) {
      try {
        const profile = await vendorProfileRepo.update(updated.profileId, { status });
        if (status === "approved" && profile) {
          revalidateVendorMatches(profile).catch(() => {});
        }
      } catch (profileErr) {
        console.error("[admin/vendor] failed to update profile status", profileErr);
      }
    }

    // Don't expose generatedPassword in the API response — it's sent by email
    return NextResponse.json({ application: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
