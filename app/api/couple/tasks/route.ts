import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { taskRepo } from "@/lib/db/repositories/taskRepo";

const TaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  monthsBeforeWedding: z.number().nonnegative(),
});

const ToggleSchema = z.object({
  id: z.string().min(1),
  completed: z.boolean(),
});

const UpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  monthsBeforeWedding: z.number().nonnegative(),
});

const DeleteSchema = z.object({
  id: z.string().min(1),
});

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ tasks: [] });

    const tasks = await taskRepo.listByProject(project.id);
    return NextResponse.json({ tasks });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const body = await req.json();
    const parsed = TaskSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { projectId, title, monthsBeforeWedding } = parsed.data;
    const project = await projectRepo.get(projectId);
    if (!project || project.userId !== user.id) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    const task = await taskRepo.create({ projectId, title, monthsBeforeWedding, completed: false });
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const body = await req.json();
    const parsed = ToggleSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const task = await taskRepo.get(parsed.data.id);
    if (!task) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });

    const project = await projectRepo.get(task.projectId);
    if (!project || project.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const updated = await taskRepo.update(parsed.data.id, { completed: parsed.data.completed });
    return NextResponse.json({ task: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const task = await taskRepo.get(parsed.data.id);
    if (!task) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });

    const project = await projectRepo.get(task.projectId);
    if (!project || project.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const updated = await taskRepo.update(parsed.data.id, {
      title: parsed.data.title,
      monthsBeforeWedding: parsed.data.monthsBeforeWedding,
    });
    return NextResponse.json({ task: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const body = await req.json();
    const parsed = DeleteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const task = await taskRepo.get(parsed.data.id);
    if (!task) return NextResponse.json({ error: "Tâche introuvable" }, { status: 404 });

    const project = await projectRepo.get(task.projectId);
    if (!project || project.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    await taskRepo.delete(parsed.data.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
