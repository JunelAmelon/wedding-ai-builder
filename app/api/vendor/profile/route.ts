import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { revalidateVendorMatches } from "@/lib/matching/engine";
import { geocodeCity, geocodeAddress } from "@/lib/geocoding/nominatim";
import type { VendorProfile } from "@/types/marketplace";
import { VendorProfileUpdateSchema, computeProfileCompletion } from "@/lib/validations/vendorProfile";

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });
    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== "vendor") return NextResponse.json({ error: "Accès réservé" }, { status: 403 });
    const profile = await vendorProfileRepo.getByUserId(user.id);
    if (!profile) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });

    const rawBody = await req.json();

    // 1. Validation stricte en liste blanche (Zod strip élimine automatiquement status, verified, tier, credits, etc.)
    const parsed = VendorProfileUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données du profil invalides", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const allowed = parsed.data;
    const updates: Partial<VendorProfile> = {};

    if (allowed.companyName !== undefined) updates.companyName = allowed.companyName;
    if (allowed.brandName !== undefined) updates.brandName = allowed.brandName;
    if (allowed.siret !== undefined) updates.siret = allowed.siret;
    if (allowed.email !== undefined) updates.email = allowed.email;
    if (allowed.phone !== undefined) updates.phone = allowed.phone;
    if (allowed.website !== undefined) updates.website = allowed.website;
    if (allowed.description !== undefined) updates.description = allowed.description;
    if (allowed.styles !== undefined) updates.styles = allowed.styles;
    if (allowed.contactName !== undefined) updates.contactName = allowed.contactName;
    if (allowed.contactRole !== undefined) updates.contactRole = allowed.contactRole;
    if (allowed.serviceCategory !== undefined) updates.serviceCategory = allowed.serviceCategory;
    if (allowed.otherCategory !== undefined) updates.otherCategory = allowed.otherCategory;
    if (allowed.yearsOfExperience !== undefined) updates.yearsOfExperience = allowed.yearsOfExperience;
    if (allowed.trainingDate !== undefined) updates.trainingDate = allowed.trainingDate;
    if (allowed.trainingDescription !== undefined) updates.trainingDescription = allowed.trainingDescription;
    if (allowed.acceptedTerms !== undefined) updates.acceptedTerms = allowed.acceptedTerms;
    if (allowed.pricingDetails !== undefined) updates.pricingDetails = allowed.pricingDetails;

    if (allowed.address) {
      let geo = profile.address?.geo;
      if (allowed.address.street && allowed.address.city && allowed.address.zipCode) {
        const fetchedGeo = await geocodeAddress(
          allowed.address.street,
          allowed.address.city,
          allowed.address.zipCode,
          allowed.address.country || profile.address?.country || "France"
        );
        if (fetchedGeo) geo = fetchedGeo;
      }

      updates.address = {
        street: allowed.address.street ?? profile.address?.street ?? "",
        city: allowed.address.city ?? profile.address?.city ?? "",
        zipCode: allowed.address.zipCode ?? profile.address?.zipCode ?? "",
        country: allowed.address.country ?? profile.address?.country ?? "France",
        ...(geo ? { geo } : {}),
      };
    }

    if (allowed.priceRange) {
      updates.priceRange = {
        min: allowed.priceRange.min ?? profile.priceRange?.min ?? 0,
        max: allowed.priceRange.max ?? profile.priceRange?.max ?? 0,
        currency: allowed.priceRange.currency ?? profile.priceRange?.currency ?? "EUR",
      };
    }

    if (allowed.serviceArea) {
      let geo = profile.serviceArea?.geo;
      if (allowed.serviceArea.cities && allowed.serviceArea.cities.length > 0) {
        const city = allowed.serviceArea.cities[0];
        const country = allowed.address?.country || profile.address?.country || "France";
        const fetchedGeo = await geocodeCity(city, country);
        if (fetchedGeo) geo = fetchedGeo;
      }

      updates.serviceArea = {
        regions: allowed.serviceArea.regions ?? profile.serviceArea?.regions ?? [],
        cities: allowed.serviceArea.cities ?? profile.serviceArea?.cities ?? [],
        radius: allowed.serviceArea.radius !== undefined ? allowed.serviceArea.radius : (profile.serviceArea?.radius ?? null),
        travelPolicy: allowed.serviceArea.travelPolicy !== undefined ? allowed.serviceArea.travelPolicy : (profile.serviceArea?.travelPolicy ?? null),
        ...(geo ? { geo } : {}),
      };
    }

    if (allowed.availability) {
      updates.availability = {
        noticePeriod: allowed.availability.noticePeriod !== undefined ? allowed.availability.noticePeriod : (profile.availability?.noticePeriod ?? null),
        peakSeasons: allowed.availability.peakSeasons ?? profile.availability?.peakSeasons ?? [],
        unavailableDates: allowed.availability.unavailableDates ?? profile.availability?.unavailableDates ?? [],
      };
    }

    if (allowed.portfolio) {
      updates.portfolio = {
        images: allowed.portfolio.images ?? profile.portfolio?.images ?? [],
        website: allowed.portfolio.website !== undefined ? allowed.portfolio.website : (profile.portfolio?.website ?? null),
        instagram: allowed.portfolio.instagram !== undefined ? allowed.portfolio.instagram : (profile.portfolio?.instagram ?? null),
        videos: allowed.portfolio.videos ?? profile.portfolio?.videos ?? [],
        faq: allowed.portfolio.faq ?? profile.portfolio?.faq ?? [],
        reviews: allowed.portfolio.reviews ?? profile.portfolio?.reviews ?? [],
        googleBusiness: profile.portfolio?.googleBusiness ?? null,
      };
    }

    if (allowed.preferences) {
      updates.preferences = {
        emailNotifications: allowed.preferences.emailNotifications ?? profile.preferences?.emailNotifications ?? true,
        opportunityAlerts: allowed.preferences.opportunityAlerts ?? profile.preferences?.opportunityAlerts ?? true,
      };
    }

    updates.profileCompletion = computeProfileCompletion({ ...profile, ...updates });

    // Barrière de sécurité absolue contre toute élévation de privilèges
    delete (updates as any).status;
    delete (updates as any).verified;
    delete (updates as any).tier;
    delete (updates as any).credits;
    delete (updates as any).reviewedAt;
    delete (updates as any).reviewedBy;
    delete (updates as any).notes;
    delete (updates as any).id;
    delete (updates as any).userId;
    delete (updates as any).createdAt;

    const updated = await vendorProfileRepo.update(profile.id, updates);
    revalidateVendorMatches(updated).catch(() => {});
    return NextResponse.json({ profile: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    if (message === "Unauthorized") return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
