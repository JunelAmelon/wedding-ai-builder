import { NextResponse } from "next/server";
import { z } from "zod";
import { vendorRepo } from "@/lib/db/repositories/vendorRepo";
import { eventRepo } from "@/lib/db/repositories/eventRepo";

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

const VendorApplicationSchema = z.object({
  companyName: z.string().min(1),
  siret: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  website: z.string().url().nullable().optional(),
  address: AddressSchema,
  serviceCategory: z.string().min(1),
  otherCategory: z.string().nullable().optional(),
  yearsOfExperience: z.number().min(0),
  trainingDate: z.string().nullable().optional(),
  trainingDescription: z.string().nullable().optional(),
  documents: z.array(DocumentSchema).default([]),
  description: z.string().min(1),
  contactName: z.string().min(1),
  contactRole: z.string().min(1),
  acceptedTerms: z.boolean().refine((v) => v === true, "Vous devez accepter les conditions."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VendorApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const payload = {
      ...parsed.data,
      website: parsed.data.website ?? null,
      otherCategory: parsed.data.otherCategory ?? null,
      trainingDate: parsed.data.trainingDate ?? null,
      trainingDescription: parsed.data.trainingDescription ?? null,
    };
    const application = await vendorRepo.create(payload);
    await eventRepo.log(application.id, "vendor_application_created", { category: application.serviceCategory });

    return NextResponse.json({ ok: true, id: application.id }, { status: 201 });
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
