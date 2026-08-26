import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { runAutoMatching } from "@/lib/matching/auto-match";
import { isVendorSubscriptionActive } from "@/lib/subscription-guard";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ recommendations: [] });

    // Always refresh suggested matches so recommendations stay up-to-date
    // (new vendors, availability changes, subscription changes are all picked up automatically)
    let matches: Awaited<ReturnType<typeof matchRepo.listByProject>>;
    try {
      await matchRepo.deleteSuggestedByProject(project.id);
      const result = await runAutoMatching(project, { perCategory: 2, notifyVendors: false });
      const freshMatches = result.matches;
      // Merge with any non-suggested matches (e.g. shortlisted, pending) that should still appear
      const existing = await matchRepo.listByProject(project.id);
      const nonSuggested = existing.filter((m) => m.status !== "suggested");
      matches = [...freshMatches, ...nonSuggested];
    } catch {
      // If auto-matching fails, fall back to existing matches
      matches = await matchRepo.listByProject(project.id);
    }

    const recommendations = await Promise.all(
      matches.map(async (m) => {
        const vendor = await vendorProfileRepo.get(m.vendorId);
        if (!vendor) return null;
        // Filter out vendors whose subscription is no longer active
        const isActive = await isVendorSubscriptionActive(vendor.userId);
        if (!isActive) return null;
        // Filter out vendors unavailable on the wedding date
        const weddingDate = project.weddingDate;
        if (weddingDate && vendor.availability?.unavailableDates?.includes(weddingDate)) return null;
        return { match: m, vendor };
      })
    );

    return NextResponse.json({ recommendations: recommendations.filter(Boolean) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    await matchRepo.deleteSuggestedByProject(project.id);
    const result = await runAutoMatching(project, { perCategory: 3, notifyVendors: true });

    const recommendations = await Promise.all(
      result.matches.map(async (m) => {
        const vendor = await vendorProfileRepo.get(m.vendorId);
        if (!vendor) return null;
        const isActive = await isVendorSubscriptionActive(vendor.userId);
        if (!isActive) return null;
        const weddingDate = project.weddingDate;
        if (weddingDate && vendor.availability?.unavailableDates?.includes(weddingDate)) return null;
        return { match: m, vendor };
      })
    );

    return NextResponse.json({ recommendations: recommendations.filter(Boolean) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
