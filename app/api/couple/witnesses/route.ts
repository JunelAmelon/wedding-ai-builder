import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { witnessRepo } from "@/lib/db/repositories/witnessRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    if (projects.length === 0) {
      return NextResponse.json({ witnesses: [] });
    }

    const witnesses = await witnessRepo.listByProject(projects[0].id);
    return NextResponse.json({ witnesses });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    if (projects.length === 0) {
      return NextResponse.json({ error: "Aucun projet trouvé" }, { status: 404 });
    }

    const body = await req.json();
    const { firstName, lastName, email, phone, role, photo, notes } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const witness = await witnessRepo.create({
      projectId: projects[0].id,
      firstName,
      lastName,
      email,
      phone,
      role: role || "Témoin",
      photo: photo || null,
      notes: notes || null,
    });

    return NextResponse.json({ witness }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
