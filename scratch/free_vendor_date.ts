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
  const vendors = await vendorProfileRepo.listApproved();
  const vendor = vendors.find((v) => v.serviceCategory.toLowerCase().includes("transport"));
  if (!vendor) {
    console.log("No transport vendor found");
    return;
  }

  console.log("Current unavailable dates for", vendor.companyName, ":", vendor.availability?.unavailableDates);
  const updatedDates = (vendor.availability?.unavailableDates || []).filter((d) => d !== "2027-02-28");
  await vendorProfileRepo.update(vendor.id, {
    availability: {
      ...vendor.availability,
      unavailableDates: updatedDates,
    },
  });
  console.log("Updated unavailable dates to:", updatedDates);
}

run().catch(console.error);
