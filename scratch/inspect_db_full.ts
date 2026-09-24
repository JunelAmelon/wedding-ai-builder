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
  const { userRepo } = await import("../lib/db/repositories/userRepo");
  const { vendorProfileRepo } = await import("../lib/db/repositories/vendorProfileRepo");
  const { vendorRepo } = await import("../lib/db/repositories/vendorRepo");
  const { adminRepo } = await import("../lib/db/repositories/adminRepo");
  const { tenderRepo } = await import("../lib/db/repositories/tenderRepo");
  const { matchRepo } = await import("../lib/db/repositories/matchRepo");
  const { proposalRepo } = await import("../lib/db/repositories/proposalRepo");
  const { projectRepo } = await import("../lib/db/repositories/projectRepo");

  const users = await userRepo.list();
  console.log(`=== USERS (${users.length}) ===`);
  users.forEach((u) => {
    console.log(`- [${u.email}] role: ${u.role} | name: ${u.firstName} ${u.lastName} | id: ${u.id}`);
  });

  const profiles = await vendorProfileRepo.list();
  console.log(`\n=== VENDOR PROFILES (${profiles.length}) ===`);
  profiles.forEach((p) => {
    console.log(
      `- id: ${p.id} | company: ${p.companyName || p.businessName} | cat: ${p.serviceCategory} | status: ${p.status} | userId: ${p.userId}`
    );
  });

  const applications = await vendorRepo.list();
  console.log(`\n=== VENDOR APPLICATIONS (${applications.length}) ===`);
  applications.forEach((a) => {
    console.log(`- id: ${a.id} | company: ${a.companyName} | cat: ${a.serviceCategory} | status: ${a.status}`);
  });

  const subs = await adminRepo.listUserSubscriptions();
  console.log(`\n=== USER SUBSCRIPTIONS (${subs.length}) ===`);
  subs.forEach((s) => {
    console.log(`- userId: ${s.userId} | plan: ${s.plan} | status: ${s.status} | end: ${s.currentPeriodEnd}`);
  });

  const tenders = await tenderRepo.list();
  console.log(`\n=== EXISTING TENDERS (${tenders.length}) ===`);
  tenders.forEach((t) => {
    console.log(`- id: ${t.id} | category: ${t.category} | status: ${t.status} | matches: ${t.matchIds?.length || 0}`);
  });

  const matches = await matchRepo.list();
  console.log(`\n=== MATCHES (${matches.length}) ===`);
  matches.forEach((m) => {
    console.log(`- id: ${m.id} | tenderId: ${m.tenderId} | cat: ${m.category} | score: ${m.score} | status: ${m.status}`);
  });

  const proposals = await proposalRepo.list();
  console.log(`\n=== PROPOSALS (${proposals.length}) ===`);
  proposals.forEach((pr) => {
    console.log(`- id: ${pr.id} | tenderId: ${pr.tenderId} | vendorId: ${pr.vendorId} | status: ${pr.status}`);
  });
}

run().catch(console.error);
