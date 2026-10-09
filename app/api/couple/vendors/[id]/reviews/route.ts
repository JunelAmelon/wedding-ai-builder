import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";

const ReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(2, "Le message doit contenir au moins 2 caractères").max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: vendorId } = await params;

    const vendor = await vendorProfileRepo.get(vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Prestataire introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = ReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Récupération automatique du nom de l'utilisateur (couple)
    const userFullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    let authorName = userFullName;

    if (!authorName && user.role === "couple") {
      const projects = await projectRepo.listByUser(user.id);
      if (projects[0]?.name) {
        authorName = projects[0].name;
      }
    }

    if (!authorName) {
      authorName = "Client";
    }

    const newReview = {
      author: authorName,
      rating: parsed.data.rating,
      text: parsed.data.text,
      date: new Date().toISOString().split("T")[0],
    };

    const currentPortfolio = vendor.portfolio || {};
    const currentReviews = currentPortfolio.reviews || [];
    const updatedReviews = [newReview, ...currentReviews];

    await vendorProfileRepo.update(vendor.id, {
      portfolio: {
        ...currentPortfolio,
        reviews: updatedReviews,
      },
    });

    return NextResponse.json({
      success: true,
      review: newReview,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Veuillez vous connecter pour laisser un avis." }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
