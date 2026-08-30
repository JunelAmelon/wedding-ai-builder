import { findTopMatches, calculateMatchScore } from "@/lib/matching/engine";
import { geocodeCity } from "@/lib/geocoding/nominatim";
import type { WeddingProject, VendorProfile } from "@/types/marketplace";

const fakeProject: WeddingProject = {
  id: "test-project",
  userId: "user-test",
  coupleProfileId: "cp-test",
  sessionId: null,
  name: "Mariage de Test",
  weddingDate: "2026-09-15",
  location: { city: "Paris", country: "France" },
  guestCount: 100,
  budget: { amount: 15000, currency: "EUR" },
  style: "rustique",
  customStyle: "",
  customStyleDescription: "On veut un photographe discret, pas de mise en scène. Anglais courant car famille à l'étranger.",
  ambiance: null,
  desiredCategories: null,
  childrenCount: null,
  dietaryNeeds: null,
  dietaryDetails: null,
  mobilityNeeds: null,
  guestsFromFar: null,
  mainPriority: "style bohème/rustique avant tout",
  stressLevel: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const fakeVendors: VendorProfile[] = [
  {
    id: "vendor-1",
    userId: "user-v1",
    status: "approved",
    logo: null,
    companyName: "Photographe Paris Pro",
    siret: "123456789",
    brandName: "Paris Pro Photo",
    email: "photo@example.com",
    phone: "0600000001",
    website: null,
    address: { street: "1 rue de Paris", city: "Paris", zipCode: "75001", country: "France" },
    serviceCategory: "photographie",
    otherCategory: null,
    yearsOfExperience: 8,
    trainingDate: null,
    trainingDescription: null,
    description: "Photographe rustique et bohème spécialisé dans les mariages intimes. Anglais courant. Photographie discrète et naturelle.",
    styles: ["rustique", "boheme"],
    contactName: "Jean Dupont",
    contactRole: "Photographe",
    priceRange: { min: 1500, max: 3000, currency: "EUR" },
    pricingDetails: "Forfaits à partir de 1500€. Photographe discret et naturel.",
    serviceArea: { regions: ["France"], cities: ["Paris"], radius: 30, travelPolicy: null },
    availability: { noticePeriod: null, peakSeasons: [], unavailableDates: [], unavailableDateRanges: [] },
    portfolio: { images: [], website: null, instagram: null, videos: [], faq: [{ question: "Parlez-vous anglais ?", answer: "Oui, couramment." }, { question: "Etes-vous discret ?", answer: "Oui, je privilégie le naturel." }], reviews: [{ author: "Marie", rating: 5, text: "Parfait pour les invités anglophones et très discret", date: "2025-01-01" }] },
    tier: "premium",
    documents: [],
    acceptedTerms: true,
    credits: 0,
    profileCompletion: 100,
    verified: true,
    reviewedAt: new Date().toISOString(),
    reviewedBy: "admin",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any,
  {
    id: "vendor-2",
    userId: "user-v2",
    status: "approved",
    logo: null,
    companyName: "Luxe Events Paris",
    siret: "987654321",
    brandName: "Luxe Events",
    email: "luxe@example.com",
    phone: "0600000002",
    website: null,
    address: { street: "10 avenue des Champs", city: "Paris", zipCode: "75008", country: "France" },
    serviceCategory: "photographie",
    otherCategory: null,
    yearsOfExperience: 2,
    trainingDate: null,
    trainingDescription: null,
    description: "Photographe chic et moderne. Style épuré. Pas spécialisé rustique.",
    styles: ["moderne", "luxe"],
    contactName: "Pierre Martin",
    contactRole: "Photographe",
    priceRange: { min: 4000, max: 8000, currency: "EUR" },
    pricingDetails: "Prestations haut de gamme",
    serviceArea: { regions: ["France"], cities: ["Paris"], radius: 20, travelPolicy: null },
    availability: { noticePeriod: null, peakSeasons: [], unavailableDates: [], unavailableDateRanges: [] },
    portfolio: { images: [], website: null, instagram: null, videos: [], faq: [], reviews: [] },
    tier: "luxe",
    documents: [],
    acceptedTerms: true,
    credits: 0,
    profileCompletion: 100,
    verified: false,
    reviewedAt: new Date().toISOString(),
    reviewedBy: "admin",
    notes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any,
];

async function main() {
  console.log("🔍 Test du moteur de matching v2\n");

  console.log("--- 1. Test géocodage Nominatim ---");
  const parisGeo = await geocodeCity("Paris", "France");
  const lyonGeo = await geocodeCity("Lyon", "France");
  console.log("Paris:", parisGeo);
  console.log("Lyon:", lyonGeo);

  if (parisGeo && lyonGeo) {
    fakeProject.location = { ...fakeProject.location, geo: parisGeo } as any;
    fakeVendors[0].serviceArea = { ...fakeVendors[0].serviceArea, geo: parisGeo };
    fakeVendors[0].address = { ...fakeVendors[0].address, geo: parisGeo };
    fakeVendors[1].serviceArea = { ...fakeVendors[1].serviceArea, geo: parisGeo };
    fakeVendors[1].address = { ...fakeVendors[1].address, geo: parisGeo };
  }

  console.log("\n--- 2. Test rule-based score ---");
  const ruleBased = calculateMatchScore({ requirements: [], priority: null }, fakeProject, fakeVendors[0], "photographie");
  console.log("Vendor 1 rule score:", ruleBased.score, ruleBased.reasons);

  console.log("\n--- 3. Test full matching IA avec priority et requirements ---");
  const start = Date.now();
  const matches = await findTopMatches(
    {
      budgetRange: { min: 12000, max: 18000, currency: "EUR" },
      guestCount: fakeProject.guestCount,
      location: fakeProject.location,
      weddingDate: fakeProject.weddingDate,
      style: fakeProject.style,
      customStyle: fakeProject.customStyle,
      requirements: ["photographe discret, pas de mise en scène", "anglais courant car famille à l'étranger"],
      priority: fakeProject.mainPriority,
    },
    fakeProject,
    fakeVendors,
    "photographie",
    3
  );
  const duration = Date.now() - start;

  console.log(`\n⏱️ Durée: ${duration}ms`);
  console.log(`📊 Nombre de matches: ${matches.length}\n`);

  for (const m of matches) {
    const vendor = fakeVendors.find((v) => v.id === m.vendorId);
    console.log(`- ${vendor?.companyName || m.vendorId}`);
    console.log(`  Score: ${m.score}`);
    console.log(`  Reasons: ${m.reasons.join(" | ")}`);
    console.log(`  Summary: ${m.summary || "-"}`);
    console.log("");
  }
}

main().catch((err) => {
  console.error("❌ Erreur:", err);
  process.exit(1);
});
