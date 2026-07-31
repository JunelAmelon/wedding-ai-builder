import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { taskRepo } from "@/lib/db/repositories/taskRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { generateWeddingPlan } from "@/lib/ai/orchestrator";
import { delCached } from "@/lib/cache/redis";

function cleanNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function cleanString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

const ProjectSchema = z.object({
  name: z.preprocess((v) => cleanString(v) ?? undefined, z.string().min(1).optional()),
  weddingDate: z.preprocess((v) => cleanString(v), z.string().nullable().optional()),
  location: z.preprocess(
    (v) => {
      if (!v || typeof v !== "object" || Array.isArray(v)) return null;
      const obj = v as { city?: unknown; country?: unknown };
      const city = cleanString(obj.city) ?? "";
      const country = cleanString(obj.country) ?? "";
      return city || country ? { city, country } : null;
    },
    z.object({ city: z.string(), country: z.string() }).nullable().optional()
  ),
  guestCount: z.preprocess((v) => cleanNumber(v), z.number().nullable().optional()),
  budget: z.preprocess(
    (v) => {
      if (!v || typeof v !== "object" || Array.isArray(v)) return null;
      const obj = v as { amount?: unknown; currency?: unknown };
      const amount = cleanNumber(obj.amount) ?? 0;
      const currency = cleanString(obj.currency) ?? "EUR";
      return { amount, currency };
    },
    z.object({ amount: z.number(), currency: z.string() }).nullable().optional()
  ),
  style: z.preprocess((v) => cleanString(v), z.string().nullable().optional()),
  customStyle: z.preprocess((v) => cleanString(v), z.string().nullable().optional()),
  customStyleDescription: z.preprocess((v) => cleanString(v), z.string().nullable().optional()),
  mainPriority: z.preprocess((v) => cleanString(v), z.string().nullable().optional()),
  stressLevel: z.preprocess((v) => cleanNumber(v), z.number().nullable().optional()),
});

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    return NextResponse.json({ project: projects[0] || null });
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
    const parsed = ProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const coupleProfile = await coupleProfileRepo.getByUserId(user.id);
    if (!coupleProfile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const project = await projectRepo.create({
      userId: user.id,
      coupleProfileId: coupleProfile.id,
      sessionId: null,
      name: parsed.data.name || "Mon mariage",
      weddingDate: parsed.data.weddingDate ?? null,
      location: parsed.data.location ?? null,
      guestCount: parsed.data.guestCount ?? null,
      budget: parsed.data.budget ?? null,
      style: (parsed.data.style as never) ?? null,
      customStyle: parsed.data.customStyle ?? null,
      customStyleDescription: parsed.data.customStyleDescription ?? null,
      mainPriority: parsed.data.mainPriority ?? null,
      stressLevel: parsed.data.stressLevel ?? null,
    });

    return NextResponse.json({ project }, { status: 201 });
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
    const parsed = ProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    const updated = await projectRepo.update(project.id, {
      ...parsed.data,
      style: parsed.data.style as never,
    });
    await matchRepo.deleteByProject(project.id);
    await taskRepo.deleteByProject(project.id);

    let regenerated = false;
    if (updated.sessionId) {
      try {
        const session = await sessionRepo.get(updated.sessionId);
        if (session) {
          if (session.userId && session.userId !== user.id) {
            return NextResponse.json({ error: "Cette session n'appartient pas à votre compte" }, { status: 403 });
          }
          const refreshedQuiz = {
            ...session.quizAnswers,
            weddingDate: updated.weddingDate ?? session.quizAnswers.weddingDate,
            location: updated.location ?? session.quizAnswers.location,
            guestCount: updated.guestCount ?? session.quizAnswers.guestCount,
            budget: updated.budget ?? session.quizAnswers.budget,
            style: updated.style ?? session.quizAnswers.style,
            customStyle: updated.customStyle ?? session.quizAnswers.customStyle,
            customStyleDescription: updated.customStyleDescription ?? session.quizAnswers.customStyleDescription,
            mainPriority: (updated.mainPriority ?? session.quizAnswers.mainPriority) as never,
            stressLevel: updated.stressLevel ?? session.quizAnswers.stressLevel,
          };
          await sessionRepo.updateAnswers(updated.sessionId, refreshedQuiz);
          await delCached(`ai-output:${updated.sessionId}`);
          const output = await generateWeddingPlan(refreshedQuiz, updated.sessionId);
          await sessionRepo.setAIOutput(updated.sessionId, output);
          await taskRepo.createFromTimeline(project.id, output.timeline);
          regenerated = true;
        }
      } catch (regenErr) {
        console.error("[couple/project] AI regeneration failed", regenErr);
      }
    }

    return NextResponse.json({ project: updated, regenerated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
