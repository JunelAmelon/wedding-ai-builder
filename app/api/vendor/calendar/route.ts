import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";

interface WeddingEvent {
  id: string;
  coupleName: string;
  date: string;
  location: string;
  status: "confirmed" | "pending" | "external";
  budget?: number;
  source: "platform" | "external";
  notes?: string;
  vendorId: string;
  createdAt: string;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = value.match(/^\d{4}-\d{2}-\d{2}$/);
  return match ? value : null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id);
    const unavailableDates = profile?.availability?.unavailableDates || [];

    const matches = await matchRepo.listByVendor(user.id);
    const acceptedMatches = matches.filter((m: any) => m.status === "accepted");
    const platformEvents: WeddingEvent[] = [];

    for (const match of acceptedMatches) {
      const project = await projectRepo.get(match.projectId);
      if (project) {
        const userAccount = await userRepo.get(project.userId);
        const firstName = userAccount?.firstName || "";
        const lastName = userAccount?.lastName || "";

        platformEvents.push({
          id: match.id,
          coupleName: `${firstName} ${lastName}`.trim() || "Couple",
          date: project.weddingDate ? project.weddingDate.slice(0, 10) : "",
          location: project.location?.city || "Non précisé",
          status: "confirmed",
          budget: project.budget?.amount,
          source: "platform",
          vendorId: user.id,
          createdAt: match.createdAt || new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ events: platformEvents, unavailableDates });
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json({ error: "Erreur de chargement" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const body = await req.json();
    const { date } = body;
    const normalizedDate = normalizeDate(date);

    if (!normalizedDate) {
      return NextResponse.json({ error: "Date invalide (format attendu : YYYY-MM-DD)" }, { status: 400 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profil prestataire introuvable" }, { status: 404 });
    }

    const current = profile.availability?.unavailableDates || [];
    if (current.includes(normalizedDate)) {
      return NextResponse.json({ error: "Cette date est déjà indisponible" }, { status: 409 });
    }

    const nextUnavailable = [...current, normalizedDate].sort();
    const availability = {
      ...(profile.availability || { noticePeriod: null, peakSeasons: [], unavailableDates: [] }),
      unavailableDates: nextUnavailable,
    };

    await vendorProfileRepo.update(profile.id, { availability });

    return NextResponse.json({
      id: normalizedDate,
      date: normalizedDate,
      unavailableDates: nextUnavailable,
    });
  } catch (error) {
    console.error("Error adding unavailable date:", error);
    return NextResponse.json({ error: "Erreur lors de l'ajout" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const date = normalizeDate(id);

    if (!date) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profil prestataire introuvable" }, { status: 404 });
    }

    const current = profile.availability?.unavailableDates || [];
    const nextUnavailable = current.filter((d) => d !== date);

    if (nextUnavailable.length === current.length) {
      return NextResponse.json({ error: "Date non trouvée" }, { status: 404 });
    }

    const availability = {
      ...(profile.availability || { noticePeriod: null, peakSeasons: [], unavailableDates: [] }),
      unavailableDates: nextUnavailable,
    };

    await vendorProfileRepo.update(profile.id, { availability });

    return NextResponse.json({
      removed: date,
      unavailableDates: nextUnavailable,
    });
  } catch (error) {
    console.error("Error deleting unavailable date:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
