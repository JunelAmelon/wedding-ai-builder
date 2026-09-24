import fs from "fs";
import path from "path";

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

async function run() {
  const { vendorProfileRepo } = await import("../lib/db/repositories/vendorProfileRepo");
  const { projectRepo } = await import("../lib/db/repositories/projectRepo");
  const { findTopMatches } = await import("../lib/matching/engine");

  const vendors = await vendorProfileRepo.listApproved();
  console.log("Approved vendors count:", vendors.length);
  const vendor = vendors[0];
  console.log("Vendor details:", {
    id: vendor?.id,
    company: vendor?.companyName,
    cat: vendor?.serviceCategory,
    priceRange: vendor?.priceRange,
    serviceArea: vendor?.serviceArea,
    status: vendor?.status,
  });

  const projects = await projectRepo.list();
  console.log("Projects count:", projects.length);
  const project = projects[0];
  console.log("Project 0:", {
    id: project?.id,
    userId: project?.userId,
    weddingDate: project?.weddingDate,
    location: project?.location,
    budget: project?.budget,
    guestCount: project?.guestCount,
  });

  if (project && vendor) {
    const tenderData = {
      projectId: project.id,
      category: "Transport",
      budgetRange: { min: 200, max: 1500, currency: "EUR" },
      guestCount: 80,
      location: project.location || { city: "Paris", country: "France" },
      weddingDate: project.weddingDate,
      style: project.style,
      requirements: [],
    };

    console.log("\nTesting findTopMatches with category 'Transport'...");
    const matches = await findTopMatches(tenderData, project, vendors, "Transport", 3);
    console.log("Matches found:", matches.length);
    for (const m of matches) {
      console.log(`- Vendor: ${m.vendorId}, Score: ${m.score}%, Summary: ${m.summary}, Reasons:`, m.reasons);
    }
  }
}

run().catch(console.error);
