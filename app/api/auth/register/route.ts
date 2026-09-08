import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { userRepo } from "@/lib/db/repositories/userRepo";
import { vendorProfileRepo } from "@/lib/db/repositories/vendorProfileRepo";
import { coupleProfileRepo } from "@/lib/db/repositories/coupleProfileRepo";
import { projectRepo } from "@/lib/db/repositories/projectRepo";
import { sessionRepo } from "@/lib/db/repositories/sessionRepo";
import { hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isLocalMode } from "@/lib/db/repositories/utils";
import { geocodeCity } from "@/lib/geocoding/nominatim";
import { sendEmail } from "@/lib/email/send";
import { verifyEmail, vendorApplicationReceivedEmail } from "@/lib/email/emails";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function geocodeLocation(location: { city?: string; country?: string } | null | undefined): Promise<{ city: string; country: string; geo?: { lat: number; lng: number } } | null> {
  if (!location?.city || !location?.country) return null;
  const geo = await geocodeCity(location.city, location.country);
  return { city: location.city, country: location.country, ...(geo ? { geo } : {}) };
}

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
  quizAnswers: z.record(z.unknown()).optional(),
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

    const { firstName, lastName, email, password, phone, address, role, sessionId, quizAnswers: clientQuizAnswers } = parsed.data;
    const existing = await userRepo.getByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
    }

    // Generate email verification token
    const verifyToken = randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

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
      verifyToken,
      verifyTokenExpiry,
      resetToken: null,
      resetTokenExpiry: null,
    });

    // Send verification email
    try {
      const verifyUrl = `${APP_URL}/api/auth/verify-email/confirm?token=${verifyToken}`;
      const { subject, html } = verifyEmail({ firstName, verifyUrl });
      await sendEmail({ to: user.email, subject, html });
    } catch (emailErr) {
      console.error("[register] Erreur envoi email vérification:", emailErr);
    }

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

      // Send vendor application received email
      try {
        const { subject, html } = vendorApplicationReceivedEmail({ firstName, lastName });
        await sendEmail({ to: user.email, subject, html });
      } catch (emailErr) {
        console.error("[register] Erreur envoi email candidature:", emailErr);
      }

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
      console.log("[register] Couple profile created:", coupleProfile.id, "for user:", user.id);

      let sessionIdToUse: string | null = null;
      let quizAnswers: any = clientQuizAnswers || {};

      if (sessionId) {
        console.log("[register] Looking for session:", sessionId, "isLocalMode:", isLocalMode());
        try {
          const session = await sessionRepo.get(sessionId);
          if (session) {
            console.log("[register] Session found, quizAnswers keys:", Object.keys(session.quizAnswers || {}));
            if (session.userId && session.userId !== user.id) {
              return NextResponse.json({ error: "Cette session est déjà associée à un autre compte" }, { status: 409 });
            }
            await sessionRepo.setUserId(sessionId, user.id);
            sessionIdToUse = sessionId;
            quizAnswers = { ...(session.quizAnswers || {}), ...quizAnswers };
          } else {
            console.warn("[register] Session not found:", sessionId, "- using client quizAnswers fallback");
          }
        } catch (sessionErr) {
          console.error("[register] Error fetching session:", sessionErr);
        }
      } else {
        console.log("[register] No sessionId provided, using client quizAnswers");
      }

      const project = await projectRepo.create({
        userId: user.id,
        coupleProfileId: coupleProfile.id,
        sessionId: sessionIdToUse,
        name: "Mon mariage",
        weddingDate: quizAnswers.weddingDate || null,
        location: await geocodeLocation(quizAnswers.location),
        guestCount: quizAnswers.guestCount || null,
        childrenCount: quizAnswers.childrenCount ?? null,
        budget: quizAnswers.budget || null,
        style: quizAnswers.style || null,
        customStyle: quizAnswers.customStyle || null,
        customStyleDescription: quizAnswers.customStyleDescription || null,
        ambiance: quizAnswers.ambiance || null,
        desiredCategories: quizAnswers.desiredCategories || null,
        dietaryNeeds: quizAnswers.dietaryNeeds || null,
        dietaryDetails: quizAnswers.dietaryDetails || null,
        mobilityNeeds: quizAnswers.mobilityNeeds ?? null,
        guestsFromFar: quizAnswers.guestsFromFar ?? null,
        mainPriority: quizAnswers.mainPriority || null,
        stressLevel: quizAnswers.stressLevel || null,
      });
      console.log("[register] Wedding project created:", project.id, "for user:", user.id);

      // Do NOT auto-login and do NOT run auto-matching yet.
      // The couple must verify their email first; matching runs on first login.
      return NextResponse.json({
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
        pendingVerification: true,
        message: "Votre compte a été créé. Veuillez vérifier votre adresse email pour accéder à votre espace et découvrir vos prestataires.",
      }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
