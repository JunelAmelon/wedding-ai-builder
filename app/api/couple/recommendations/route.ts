import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { proposalRepo } from "@/lib/db/repositories/proposalRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { matchRepo } from "@/lib/db/repositories/matchRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { runAutoMatching } from "@/lib/matching/auto-match";
import { MIN_MATCH_SCORE } from "@/lib/matching/engine";
import { isVendorSubscriptionActive } from "@/lib/subscription-guard";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// GET returns existing recommendations without recalculating to avoid expensive AI calls on every page load.
export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ recommendations: [] });

    const matches = await matchRepo.listByProject(project.id);

    const recommendations = await Promise.all(
      matches.map(async (m) => {
        if (m.status === "rejected" || m.score < MIN_MATCH_SCORE) return null;
        const vendor = await vendorProfileRepo.get(m.vendorId);
        if (!vendor) return null;
        // Filter out vendors whose subscription is no longer active or who are unavailable on the wedding date
        const isActive = await isVendorSubscriptionActive(vendor.userId);
        if (!isActive) return null;
        const weddingDate = project.weddingDate;
        if (weddingDate && vendor.availability?.unavailableDates?.includes(weddingDate)) return null;
        const proposal = m.status === "contacted" ? await proposalRepo.getByMatchAndVendor(m.id, m.vendorId) : null;
        return { match: m, vendor, proposal };
      })
    );

    return NextResponse.json({ recommendations: recommendations.filter(Boolean) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST explicitly refreshes recommendations (rate-limited) and notifies newly matched vendors.
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "couple") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });

    // Rate limit: 5 refreshes per hour per couple to prevent AI cost abuse
    const ip = getClientIp(req);
    const rate = await checkRateLimit(`recommendations:${user.id}:${ip}`, 5, 3600);
    if (!rate.allowed) {
      return NextResponse.json({ error: "Trop de rafraîchissements. Réessayez plus tard." }, { status: 429 });
    }

    const projects = await projectRepo.listByUser(user.id);
    const project = projects[0];
    if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });

    await matchRepo.deleteSuggestedByProject(project.id);
    const result = await runAutoMatching(project, { perCategory: 3, notifyVendors: true });

    const recommendations = await Promise.all(
      result.matches.filter((m) => m.score >= MIN_MATCH_SCORE).map(async (m) => {
        if (m.status === "rejected") return null;
        const vendor = await vendorProfileRepo.get(m.vendorId);
        if (!vendor) return null;
        const isActive = await isVendorSubscriptionActive(vendor.userId);
        if (!isActive) return null;
        const weddingDate = project.weddingDate;
        if (weddingDate && vendor.availability?.unavailableDates?.includes(weddingDate)) return null;
        const proposal = m.status === "contacted" ? await proposalRepo.getByMatchAndVendor(m.id, m.vendorId) : null;
        return { match: m, vendor, proposal };
      })
    );

    return NextResponse.json({ recommendations: recommendations.filter(Boolean) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
