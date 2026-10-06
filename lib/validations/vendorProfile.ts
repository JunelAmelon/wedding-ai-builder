import { z } from "zod";
import type { VendorProfile } from "@/types/marketplace";

/**
 * Schéma Zod strict en liste blanche pour interdire toute élévation de privilèges
 * (status, verified, tier, credits, profileCompletion, reviewedAt, etc. sont exclus).
 */
export const VendorProfileUpdateSchema = z.object({
  companyName: z.string().min(1).max(150).optional(),
  brandName: z.string().max(150).nullable().optional(),
  siret: z.string().max(50).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  website: z.string().max(500).nullable().optional(),
  description: z.string().max(10000).optional(),
  styles: z.array(z.string().max(100)).optional(),
  contactName: z.string().max(150).optional(),
  contactRole: z.string().max(150).optional(),
  serviceCategory: z.string().max(100).optional(),
  otherCategory: z.string().max(150).nullable().optional(),
  yearsOfExperience: z.number().min(0).max(100).optional(),
  trainingDate: z.string().max(100).nullable().optional(),
  trainingDescription: z.string().max(2000).nullable().optional(),
  acceptedTerms: z.boolean().optional(),
  address: z
    .object({
      street: z.string().max(250).optional(),
      city: z.string().max(150).optional(),
      zipCode: z.string().max(30).optional(),
      country: z.string().max(100).optional(),
    })
    .optional(),
  priceRange: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
      currency: z.string().max(10).optional(),
    })
    .optional(),
  pricingDetails: z.string().max(3000).nullable().optional(),
  serviceArea: z
    .object({
      regions: z.array(z.string().max(100)).optional(),
      cities: z.array(z.string().max(100)).optional(),
      radius: z.number().nullable().optional(),
      travelPolicy: z.string().max(1000).nullable().optional(),
    })
    .optional(),
  availability: z
    .object({
      noticePeriod: z.string().max(200).nullable().optional(),
      peakSeasons: z.array(z.string().max(100)).optional(),
      unavailableDates: z.array(z.string().max(50)).optional(),
      unavailableDateRanges: z
        .array(
          z.object({
            startDate: z.string().max(50),
            endDate: z.string().max(50),
            reason: z.string().max(200).optional(),
          })
        )
        .optional(),
    })
    .optional(),
  portfolio: z
    .object({
      images: z
        .array(
          z.object({
            url: z.string().max(1000),
            publicId: z.string().max(500).optional().default(""),
            filename: z.string().max(300).optional().default(""),
          })
        )
        .optional(),
      website: z.string().max(500).nullable().optional(),
      instagram: z.string().max(300).nullable().optional(),
      videos: z.array(z.string().max(1000)).optional(),
      faq: z
        .array(
          z.object({
            question: z.string().max(500),
            answer: z.string().max(2000),
          })
        )
        .optional(),
      reviews: z
        .array(
          z.object({
            author: z.string().max(150),
            rating: z.number().min(1).max(5),
            text: z.string().max(3000),
            date: z.string().max(100),
          })
        )
        .optional(),
    })
    .optional(),
  preferences: z
    .object({
      emailNotifications: z.boolean().optional(),
      opportunityAlerts: z.boolean().optional(),
    })
    .optional(),
});

export function computeProfileCompletion(merged: Partial<VendorProfile>): number {
  const required = [
    merged.companyName,
    merged.siret,
    merged.email,
    merged.phone,
    merged.description,
    merged.contactName,
    merged.serviceCategory,
    merged.address?.city,
    merged.address?.country,
    merged.priceRange?.min,
    merged.priceRange?.max,
    merged.acceptedTerms,
  ];
  const filled = required.filter((v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v > 0;
    return typeof v === "string" && v.trim().length > 0;
  }).length;
  return Math.round((filled / required.length) * 100);
}
