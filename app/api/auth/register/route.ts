import { NextResponse } from "next/server";
import { z } from "zod";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const RegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["couple", "vendor"]),
  source: z.enum(["quiz", "vendor_landing", "direct"]).default("direct"),
  sessionId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = await checkRateLimit(`register:${ip}`, 5, 3600);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Trop de créations de compte. Réessayez plus tard." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 400 });
    }

    const { firstName, lastName, email, password, phone, address, role, sessionId } = parsed.data;
    const existing = await userRepo.getByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
    }

    const user = await userRepo.create({
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      googleId: null,
      firstName,
      lastName,
      avatarUrl: null,
      phone: phone || null,
      address: address || null,
      role,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      emailVerified: false,
      resetToken: null,
      resetTokenExpiry: null,
    });

    if (role === "vendor") {
      await vendorProfileRepo.create({
        userId: user.id,
        status: "pending",
        companyName: "",
        siret: "",
        brandName: null,
        email: user.email,
        phone: phone || "",
        website: null,
        address: { street: "", city: "", zipCode: "", country: "" },
        serviceCategory: "",
        otherCategory: null,
        logo: null,
        yearsOfExperience: 0,
        trainingDate: null,
        trainingDescription: null,
        description: "",
        styles: [],
        contactName: `${firstName} ${lastName}`,
        contactRole: "",
        priceRange: { min: 0, max: 0, currency: "EUR" },
        pricingDetails: null,
        serviceArea: { regions: [], cities: [], radius: null, travelPolicy: null },
        availability: { noticePeriod: null, peakSeasons: [], unavailableDates: [] },
        portfolio: { images: [], website: null, instagram: null, videos: [], faq: [], reviews: [] },
        tier: "standard",
        documents: [],
        acceptedTerms: false,
        reviewedAt: null,
        reviewedBy: null,
        notes: null,
      });
      // Vendors must be validated by an admin before they can log in.
      // Do NOT create a session — return a pending message instead.
      return NextResponse.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        pending: true,
        message: "Votre compte professionnel a été créé. Il doit être validé par notre équipe avant que vous puissiez vous connecter. Vous recevrez un email dès qu'il sera approuvé.",
      }, { status: 201 });
    }

    const coupleProfile = await coupleProfileRepo.create({
        userId: user.id,
        weddingDate: null,
        location: null,
        guestCount: null,
        budget: null,
        style: null,
        customStyle: null,
        customStyleDescription: null,
        mainPriority: null,
        stressLevel: null,
        favoriteVendorIds: [],
      });

      if (sessionId) {
        const session = await sessionRepo.get(sessionId);
        if (session) {
          if (session.userId && session.userId !== user.id) {
            return NextResponse.json({ error: "Cette session est déjà associée à un autre compte" }, { status: 409 });
          }
          await sessionRepo.setUserId(sessionId, user.id);
          await projectRepo.create({
            userId: user.id,
            coupleProfileId: coupleProfile.id,
            sessionId,
            name: "Mon mariage",
            weddingDate: session.quizAnswers.weddingDate || null,
            location: session.quizAnswers.location || null,
            guestCount: session.quizAnswers.guestCount || null,
            budget: session.quizAnswers.budget || null,
            style: session.quizAnswers.style || null,
            customStyle: session.quizAnswers.customStyle || null,
            customStyleDescription: session.quizAnswers.customStyleDescription || null,
            mainPriority: session.quizAnswers.mainPriority || null,
            stressLevel: session.quizAnswers.stressLevel || null,
          });
        }
      }

    const token = createSession(user);
    const response = NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
