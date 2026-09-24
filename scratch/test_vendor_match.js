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

async function testMatch() {
  const { vendorProfileRepo } = await import("../lib/db/repositories/vendorProfileRepo.ts");
  const { projectRepo } = await import("../lib/db/repositories/projectRepo.ts");
  const { calculateCompatibility } = await import("../lib/matching/engine.ts");

  const projects = await projectRepo.list();
  const project = projects[0];
  console.log("Client project:", { id: project?.id, city: project?.location?.city, date: project?.weddingDate });

  const vendor = await vendorProfileRepo.get("DugLqRRz899S");
  console.log("Vendor Wedding Reception:", {
    id: vendor?.id,
    name: vendor?.companyName,
    category: vendor?.serviceCategory,
    status: vendor?.status,
    verified: vendor?.verified,
    unavailableDates: vendor?.availability?.unavailableDates,
  });

  if (project && vendor) {
    const dummyTender = {
      projectId: project.id,
      category: vendor.serviceCategory,
      budgetRange: { min: 2000, max: 8000 },
      guestCount: project.guestCount,
      location: project.location,
      weddingDate: project.weddingDate,
      style: project.style,
      customStyle: project.customStyle,
      requirements: [],
      priority: "Maîtriser le budget"
    };

    const res = calculateCompatibility(vendor, dummyTender, project);
    console.log("Matching result:", res);
  }
}

testMatch().catch(console.error);
