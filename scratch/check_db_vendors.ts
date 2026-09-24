import fs from "fs";
import path from "path";

// Load .env.local manually
try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        val = val.replace(/\\n/g, "\n");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch (e) {
  console.error("Failed to load .env.local", e);
}

async function run() {
  const { vendorProfileRepo } = await import("../lib/db/repositories/vendorProfileRepo");
  const { isVendorSubscriptionActive } = await import("../lib/subscription-guard");
  const { isLocalMode } = await import("../lib/db/repositories/utils");

  console.log("Database mode:", isLocalMode() ? "LOCAL" : "FIREBASE");

  const allProfiles = await vendorProfileRepo.list();
  console.log(`Total vendor profiles in DB: ${allProfiles.length}`);

  const approvedProfiles = await vendorProfileRepo.listApproved();
  console.log(`Approved vendor profiles: ${approvedProfiles.length}\n`);

  const categoryMap: Record<string, any[]> = {};

  for (const p of allProfiles) {
    const isSubActive = await isVendorSubscriptionActive(p.userId);
    const cat = p.serviceCategory || "Non défini";
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push({
      id: p.id,
      userId: p.userId,
      businessName: p.businessName || p.name || p.companyName,
      status: p.status,
      serviceCategory: p.serviceCategory,
      isSubActive,
      city: p.serviceArea?.cities?.[0] || "Non précisé",
      priceRange: p.priceRange ? `${p.priceRange.min} - ${p.priceRange.max} €` : "Non précisé",
    });
  }

  for (const [cat, list] of Object.entries(categoryMap)) {
    console.log(`=== Catégorie : ${cat} (${list.length} prestataires) ===`);
    list.forEach((v) => {
      console.log(
        `  - [${v.businessName}] (id: ${v.id}) | Statut: ${v.status} | Abonnement actif: ${v.isSubActive ? "OUI" : "NON"} | Ville: ${v.city} | Prix: ${v.priceRange}`
      );
    });
    console.log("");
  }
}

run().catch(console.error);
