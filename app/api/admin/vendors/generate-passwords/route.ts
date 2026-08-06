import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireAdmin } from "@/lib/auth";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { hashPassword } from "@/lib/auth";

function generatePassword(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

export async function POST() {
  try {
    await requireAdmin();
    const allUsers = await userRepo.list();
    const vendorUsers = allUsers.filter((u) => u.role === "vendor");
    const vendorsWithoutPassword = vendorUsers.filter((u) => !u.passwordHash && !u.googleId);

    const results: { email: string; userId: string; generatedPassword: string }[] = [];

    for (const user of vendorsWithoutPassword) {
      const generatedPassword = generatePassword();
      await userRepo.update(user.id, { passwordHash: hashPassword(generatedPassword) });
      results.push({ email: user.email, userId: user.id, generatedPassword });
    }

    return NextResponse.json({
      ok: true,
      generatedCount: results.length,
      generated: results,
      skipped: vendorUsers.length - vendorsWithoutPassword.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    console.error("[admin/vendors/generate-passwords]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
