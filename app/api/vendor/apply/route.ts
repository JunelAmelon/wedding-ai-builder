import { NextResponse } from "next/server";
import { z } from "zod";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { hashPassword } from "@/lib/auth";

const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().min(1),
});

const DocumentSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  filename: z.string().min(1),
});

const PriceRangeSchema = z.object({
  min: z.number().min(0),
  max: z.number().min(0),
  currency: z.string().min(1),
});

const ServiceAreaSchema = z.object({
  regions: z.array(z.string().min(1)).default([]),
  cities: z.array(z.string().min(1)).default([]),
  radius: z.number().nullable().optional(),
  travelPolicy: z.string().nullable().optional(),
});

const AvailabilitySchema = z.object({
  noticePeriod: z.string().nullable().optional(),
  peakSeasons: z.array(z.string().min(1)).default([]),
  unavailableDates: z.array(z.string().min(1)).default([]),
});

const PortfolioSchema = z.object({
  images: z.array(DocumentSchema).default([]),
  website: z.string().url().nullable().optional(),
  instagram: z.string().nullable().optional(),
  videos: z.array(z.string().url()).default([]),
  faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).default([]),
  reviews: z.array(z.object({ author: z.string().min(1), rating: z.number().min(0).max(5), text: z.string().min(1), date: z.string() })).default([]),
});

const VendorApplicationSchema = z.object({
  companyName: z.string().min(1),
  siret: z.string().min(1),
  brandName: z.string().nullable().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(1),
  website: z.string().url().nullable().optional(),
  address: AddressSchema,
  serviceCategory: z.string().min(1),
  otherCategory: z.string().nullable().optional(),
  yearsOfExperience: z.number().min(0),
  trainingDate: z.string().nullable().optional(),
  trainingDescription: z.string().nullable().optional(),
  description: z.string().min(1),
  styles: z.array(z.string().min(1)).default([]),
  contactName: z.string().min(1),
  contactRole: z.string().min(1),
  priceRange: PriceRangeSchema,
  pricingDetails: z.string().nullable().optional(),
  serviceArea: ServiceAreaSchema,
  availability: AvailabilitySchema,
  portfolio: PortfolioSchema,
  tier: z.enum(["economique", "standard", "premium", "luxe"]),
  documents: z.array(DocumentSchema).default([]),
  acceptedTerms: z.boolean().refine((v) => v === true, "Vous devez accepter les conditions."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VendorApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { password, ...applicationData } = parsed.data;

    const existing = await userRepo.getByEmail(applicationData.email);
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
    }

    const [firstName, ...lastNameParts] = applicationData.contactName.trim().split(/\s+/);
    const lastName = lastNameParts.join(" ");

    const user = await userRepo.create({
      email: applicationData.email.toLowerCase(),
      passwordHash: hashPassword(password),
      googleId: null,
      firstName: firstName || applicationData.contactName,
      lastName: lastName || "",
      avatarUrl: null,
      phone: applicationData.phone,
      address: null,
      role: "vendor",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      emailVerified: false,
      resetToken: null,
      resetTokenExpiry: null,
    });

    const profile = await vendorProfileRepo.create({
      userId: user.id,
      status: "pending",
      logo: null,
      companyName: applicationData.companyName,
      siret: applicationData.siret,
      brandName: applicationData.brandName ?? null,
      email: user.email,
      phone: applicationData.phone,
      website: applicationData.website ?? null,
      address: applicationData.address,
      serviceCategory: applicationData.serviceCategory,
      otherCategory: applicationData.otherCategory ?? null,
      yearsOfExperience: applicationData.yearsOfExperience,
      trainingDate: applicationData.trainingDate ?? null,
      trainingDescription: applicationData.trainingDescription ?? null,
      description: applicationData.description,
      styles: applicationData.styles,
      contactName: applicationData.contactName,
      contactRole: applicationData.contactRole,
      priceRange: applicationData.priceRange,
      pricingDetails: applicationData.pricingDetails ?? null,
      serviceArea: {
        ...applicationData.serviceArea,
        radius: applicationData.serviceArea.radius ?? null,
        travelPolicy: applicationData.serviceArea.travelPolicy ?? null,
      },
      availability: {
        ...applicationData.availability,
        noticePeriod: applicationData.availability.noticePeriod ?? null,
      },
      portfolio: {
        ...applicationData.portfolio,
        website: applicationData.portfolio.website ?? null,
        instagram: applicationData.portfolio.instagram ?? null,
      },
      tier: applicationData.tier,
      documents: applicationData.documents,
      acceptedTerms: applicationData.acceptedTerms,
      reviewedAt: null,
      reviewedBy: null,
      notes: null,
    });

    const application = await vendorRepo.create({
      companyName: applicationData.companyName,
      siret: applicationData.siret,
      brandName: applicationData.brandName ?? null,
      email: applicationData.email,
      phone: applicationData.phone,
      website: applicationData.website ?? null,
      address: applicationData.address,
      serviceCategory: applicationData.serviceCategory,
      otherCategory: applicationData.otherCategory ?? null,
      yearsOfExperience: applicationData.yearsOfExperience,
      trainingDate: applicationData.trainingDate ?? null,
      trainingDescription: applicationData.trainingDescription ?? null,
      description: applicationData.description,
      styles: applicationData.styles,
      contactName: applicationData.contactName,
      contactRole: applicationData.contactRole,
      priceRange: applicationData.priceRange,
      pricingDetails: applicationData.pricingDetails ?? null,
      serviceArea: {
        ...applicationData.serviceArea,
        radius: applicationData.serviceArea.radius ?? null,
        travelPolicy: applicationData.serviceArea.travelPolicy ?? null,
      },
      availability: {
        ...applicationData.availability,
        noticePeriod: applicationData.availability.noticePeriod ?? null,
      },
      portfolio: {
        ...applicationData.portfolio,
        website: applicationData.portfolio.website ?? null,
        instagram: applicationData.portfolio.instagram ?? null,
      },
      tier: applicationData.tier,
      documents: applicationData.documents,
      acceptedTerms: applicationData.acceptedTerms,
      userId: user.id,
      profileId: profile.id,
    });
    await eventRepo.log(application.id, "vendor_application_created", { category: application.serviceCategory });

    // Vendors must be validated by an admin before they can log in.
    // Do NOT create a session — return a pending message instead.
    const response = NextResponse.json(
      {
        ok: true,
        id: application.id,
        pending: true,
        message: "Votre candidature a été soumise. Elle doit être validée par notre équipe avant que vous puissiez vous connecter. Vous recevrez un email dès qu'elle sera approuvée.",
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      },
      { status: 201 }
    );
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    console.error("[vendor/apply]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const applications = await vendorRepo.list();
    return NextResponse.json({ applications });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
