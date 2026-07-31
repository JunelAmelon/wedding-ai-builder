import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { adminRepo } from "@/lib/db/repositories/adminRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["superadmin", "moderator", "support", "commercial"]),
});

export async function POST(req: Request) {
  try {
    const currentUser = await requireAdmin("superadmin");
    const body = await req.json();
    const parsed = InviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { email, role } = parsed.data;
    const existing = await userRepo.getByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
    }

    const invite = await adminRepo.createInvitation({ email, role, invitedBy: currentUser.id });
    return NextResponse.json({ invite });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
