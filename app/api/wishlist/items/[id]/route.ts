import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { wishlistItemRepo } from "@/lib/db/repositories/wishlistRepo";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await import("next/headers").then((m) => m.cookies());
    const token = cookieStore.get("wab_session")?.value;
    const user = token ? verifySession(token) : null;

    if (!user || user.role !== "couple") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await wishlistItemRepo.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting wishlist item:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
