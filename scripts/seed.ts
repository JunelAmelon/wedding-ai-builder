// scripts/seed.ts
// Crée des comptes de test dans la base configurée (Firebase / local).
// Modifie les constantes ci-dessous puis lance : npm run seed

import { randomBytes, pbkdf2Sync } from "crypto";
import { userRepo } from "../lib/db/repositories/userRepo";
import { coupleProfileRepo } from "../lib/db/repositories/coupleProfileRepo";
import { vendorProfileRepo } from "../lib/db/repositories/vendorProfileRepo";
import type { UserAccount } from "../types/marketplace";

try {
  process.loadEnvFile(".env");
} catch {
  console.warn("Aucun fichier .env trouvé, utilisation des variables d'environnement existantes.");
}

// -------- MODIFIEZ ICI --------
const SEED_PASSWORD = "DemoPass123!";
const now = new Date().toISOString();

const ADMIN = {
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "Demo",
  role: "admin" as const,
  adminRole: "superadmin" as const,
};

const COUPLE = {
  email: "couple@example.com",
  firstName: "Marie",
  lastName: "Dupont",
  role: "couple" as const,
};

const VENDOR_APPROVED = {
  email: "vendor@example.com",
  firstName: "Pierre",
  lastName: "Martin",
  role: "vendor" as const,
};

const VENDOR_PENDING = {
  email: "vendor-pending@example.com",
  firstName: "Paul",
  lastName: "Pending",
  role: "vendor" as const,
};
// --------------------------------

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 32, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function baseUser(seed: {
  email: string;
  firstName: string;
  lastName: string;
  role: UserAccount["role"];
  adminRole?: UserAccount["adminRole"];
}): Omit<UserAccount, "id" | "createdAt" | "updatedAt"> {
  return {
    email: seed.email,
    passwordHash: hashPassword(SEED_PASSWORD),
    googleId: null,
    firstName: seed.firstName,
    lastName: seed.lastName,
    avatarUrl: null,
    phone: null,
    address: null,
    role: seed.role,
    adminRole: seed.adminRole,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    emailVerified: true,
  };
}

function baseVendorProfile(user: UserAccount, status: "approved" | "pending") {
  return {
    userId: user.id,
    status,
    companyName: `${user.firstName} ${user.lastName} Productions`,
    siret: "12345678901234",
    brandName: `${user.firstName} Pro`,
    email: user.email,
    phone: "0123456789",
    website: null,
    address: { street: "10 rue de la Paix", city: "Paris", zipCode: "75002", country: "France" },
    serviceCategory: "photographe",
    otherCategory: null,
    logo: null,
    yearsOfExperience: 5,
    trainingDate: null,
    trainingDescription: null,
    description: "Prestataire de démonstration pour tester la plateforme Mariage Facile.",
    styles: ["boheme", "classique"],
    contactName: user.firstName,
    contactRole: "Responsable",
    priceRange: { min: 800, max: 2500, currency: "EUR" },
    pricingDetails: null,
    serviceArea: { regions: ["Île-de-France"], cities: ["Paris"], radius: 50, travelPolicy: null },
    availability: { noticePeriod: "2 mois", peakSeasons: ["juin", "juillet", "août"], unavailableDates: [] },
    portfolio: { images: [], website: null, instagram: null, videos: [], faq: [], reviews: [] },
    tier: "standard" as const,
    documents: [],
    acceptedTerms: true,
    reviewedAt: status === "approved" ? now : null,
    reviewedBy: status === "approved" ? "admin-seed" : null,
    notes: null,
  };
}

function baseCoupleProfile(user: UserAccount) {
  return {
    userId: user.id,
    weddingDate: "2027-06-15" as string | null,
    location: { city: "Paris", country: "France" },
    guestCount: 80,
    budget: { amount: 25000, currency: "EUR" },
    style: "classique" as const,
    customStyle: null,
    customStyleDescription: null,
    mainPriority: "ambiance",
    stressLevel: 2,
    favoriteVendorIds: [],
  };
}

async function seed() {
  const created: { email: string; role: string; adminRole: UserAccount["adminRole"] | null }[] = [];

  for (const seed of [ADMIN, COUPLE, VENDOR_APPROVED, VENDOR_PENDING]) {
    let user = await userRepo.getByEmail(seed.email);
    if (!user) {
      user = await userRepo.create({
        ...baseUser(seed),
        adminRole: seed.role === "admin" ? (seed as typeof ADMIN).adminRole : undefined,
      });
    }

    if (seed.role === "couple") {
      const existing = await coupleProfileRepo.getByUserId(user.id);
      if (!existing) await coupleProfileRepo.create(baseCoupleProfile(user));
    }

    if (seed.role === "vendor") {
      const existing = await vendorProfileRepo.getByUserId(user.id);
      if (!existing) {
        await vendorProfileRepo.create(
          baseVendorProfile(user, seed.email === VENDOR_PENDING.email ? "pending" : "approved")
        );
      }
    }

    created.push({ email: user.email, role: user.role, adminRole: user.adminRole ?? null });
  }

  console.log("Seed terminé. Comptes créés (mot de passe :", SEED_PASSWORD, ")");
  console.table(created.map((u) => ({ ...u, password: SEED_PASSWORD })));
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
