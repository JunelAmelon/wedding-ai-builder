import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { expenseRepo } from "@/lib/db/repositories/expenseRepo";

const ExpenseSchema = z.object({
  projectId: z.string().min(1),
  label: z.string().min(1),
  category: z.string().min(1),
  plannedAmount: z.number().nonnegative(),
  actualAmount: z.number().nonnegative().nullable().optional(),
  currency: z.string().min(1),
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
    if (!project) return NextResponse.json({ expenses: [] });

    const expenses = await expenseRepo.listByProject(project.id);
    return NextResponse.json({ expenses });
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
    const parsed = ExpenseSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });

    const { projectId, label, category, plannedAmount, actualAmount, currency } = parsed.data;
    const project = await projectRepo.get(projectId);
    if (!project || project.userId !== user.id) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    const expense = await expenseRepo.create({
      projectId,
      label,
      category,
      plannedAmount,
      actualAmount: actualAmount ?? null,
      currency,
      paid: false,
    });

    return NextResponse.json({ expense }, { status: 201 });
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

    const expense = await expenseRepo.get(parsed.data.id);
    if (!expense) return NextResponse.json({ error: "Dépense introuvable" }, { status: 404 });

    const project = await projectRepo.get(expense.projectId);
    if (!project || project.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    await expenseRepo.delete(parsed.data.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
