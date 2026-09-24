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

async function check() {
  const { vendorProfileRepo } = await import("../lib/db/repositories/vendorProfileRepo.ts");
  const { vendorRepo } = await import("../lib/db/repositories/vendorRepo.ts");
  const { userRepo } = await import("../lib/db/repositories/userRepo.ts");

  const profiles = await vendorProfileRepo.list();
  console.log("=== VENDOR PROFILES ===");
  for (const p of profiles) {
    console.log({
      id: p.id,
      companyName: p.companyName,
      status: p.status,
      verified: p.verified,
      website: p.website,
      portfolioWebsite: p.portfolio?.website,
      createdAt: p.createdAt
    });
  }

  const apps = await vendorRepo.list();
  console.log("=== VENDOR APPLICATIONS ===");
  for (const a of apps) {
    console.log({
      id: a.id,
      companyName: a.companyName,
      status: a.status,
      profileId: a.profileId,
      userId: a.userId,
      createdAt: a.createdAt
    });
  }
}

check().catch(console.error);
