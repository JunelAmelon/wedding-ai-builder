const path = require("path");
const fs = require("fs");

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
} catch (e) {}

async function updateVendors() {
  const { vendorProfileRepo } = await import("../lib/db/repositories/vendorProfileRepo.ts");

  const profiles = await vendorProfileRepo.list();
  for (const p of profiles) {
    const effectiveWebsite = p.website || p.portfolio?.website || null;
    const formattedWebsite = effectiveWebsite
      ? (effectiveWebsite.startsWith("http://") || effectiveWebsite.startsWith("https://") ? effectiveWebsite : `https://${effectiveWebsite}`)
      : null;

    const updates = {
      verified: p.status === "approved" ? true : false,
      website: formattedWebsite,
      portfolio: {
        ...(p.portfolio || { images: [], videos: [], faq: [], reviews: [] }),
        website: formattedWebsite,
      },
    };

    console.log(`Updating vendor ${p.companyName} (${p.id})...`, updates);
    await vendorProfileRepo.update(p.id, updates);
  }

  console.log("Done updating vendors.");
  const updatedProfiles = await vendorProfileRepo.list();
  for (const up of updatedProfiles) {
    console.log({
      id: up.id,
      companyName: up.companyName,
      status: up.status,
      verified: up.verified,
      website: up.website,
      portfolioWebsite: up.portfolio?.website,
    });
  }
}

updateVendors().catch(console.error);
