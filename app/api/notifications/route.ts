import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { notificationRepo } from "@/lib/db/repositories/notificationRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    const notifications = await notificationRepo.listByUser(user.id);
    return NextResponse.json({ notifications });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const MarkSchema = z.object({
  notificationId: z.string().min(1),
});

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = MarkSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const notification = await notificationRepo.get(parsed.data.notificationId);
    if (!notification || notification.userId !== user.id) {
      return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
    }

    const updated = await notificationRepo.markAsRead(parsed.data.notificationId);
    return NextResponse.json({ notification: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const user = await requireAuth();
    await notificationRepo.markAllAsRead(user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
