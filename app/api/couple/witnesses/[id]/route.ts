import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { witnessRepo } from "@/lib/db/repositories/witnessRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const { id } = await params;
    const witness = await witnessRepo.get(id);
    if (!witness) {
      return NextResponse.json({ error: "Témoin non trouvé" }, { status: 404 });
    }

    const projects = await projectRepo.listByUser(user.id);
    if (!projects.some((p) => p.id === witness.projectId)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const body = await req.json();
    const { firstName, lastName, email, phone, role, photo, notes } = body;

    const updated = await witnessRepo.update(id, {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(role && { role }),
      ...(photo !== undefined && { photo }),
      ...(notes !== undefined && { notes }),
    });

    return NextResponse.json({ witness: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const { id } = await params;
    const witness = await witnessRepo.get(id);
    if (!witness) {
      return NextResponse.json({ error: "Témoin non trouvé" }, { status: 404 });
    }

    const projects = await projectRepo.listByUser(user.id);
    if (!projects.some((p) => p.id === witness.projectId)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await witnessRepo.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
