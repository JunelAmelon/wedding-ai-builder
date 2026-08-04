import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";

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

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    // Récupérer les mariages bookés via la plateforme (couples qui ont validé le profil)
    const matches = await matchRepo.listByVendor(user.id);
    const acceptedMatches = matches.filter((m: any) => m.status === "accepted");

    const platformEvents: WeddingEvent[] = [];
    
    for (const match of acceptedMatches) {
      const project = await projectRepo.get(match.projectId);
      if (project) {
        // Récupérer le user account pour avoir les noms
        const userAccount = await userRepo.get(project.userId);
        const firstName = userAccount?.firstName || "";
        const lastName = userAccount?.lastName || "";
        
        platformEvents.push({
          id: match.id,
          coupleName: `${firstName} ${lastName}`.trim() || "Couple",
          date: project.weddingDate || "",
          location: project.location?.city || "Non précisé",
          status: "confirmed",
          budget: project.budget?.amount,
          source: "platform",
          vendorId: user.id,
          createdAt: match.createdAt || new Date().toISOString(),
        });
      }
    }

    // Pour l'instant, on retourne seulement les événements plateforme
    // TODO: Ajouter repository pour vendorCalendar quand disponible
    return NextResponse.json({ events: platformEvents });
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
    const { coupleName, date, location, budget, notes } = body;

    if (!coupleName || !date) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    // TODO: Créer repository pour vendorCalendar
    // Pour l'instant, on retourne un message temporaire
    return NextResponse.json({ 
      message: "Fonctionnalité en cours de développement - utilisez le calendrier via les matches plateforme pour l'instant",
      event: {
        id: "temp-" + Date.now(),
        coupleName,
        date,
        location,
        budget: budget || null,
        notes: notes || null,
        vendorId: user.id,
        source: "external",
        status: "external",
        createdAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error("Error adding calendar event:", error);
    return NextResponse.json({ error: "Erreur lors de l'ajout" }, { status: 500 });
  }
}
