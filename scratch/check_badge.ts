import { projectRepo } from "../lib/db/repositories/projectRepo";
import { proposalRepo } from "../lib/db/repositories/proposalRepo";
import { tenderRepo } from "../lib/db/repositories/tenderRepo";
import { userRepo } from "../lib/db/repositories/userRepo";

async function run() {
  const users = await userRepo.list();
  const couple = users.find((u: any) => u.email?.toLowerCase().includes("elisabeth") || u.firstName?.toLowerCase().includes("elisabeth"));
  console.log("Couple found:", couple?.id, couple?.email, couple?.firstName, couple?.lastName);
  if (!couple) return;

  const projects = await projectRepo.listByUser(couple.id);
  console.log("Project weddingDate:", projects[0]?.weddingDate);
  console.log("Project createdAt:", projects[0]?.createdAt);

  const proposals = await proposalRepo.listByProject(projects[0].id);
  console.log("Proposals count:", proposals.length);
  for (const p of proposals) {
    console.log("Proposal:", JSON.stringify(p, null, 2));
  }

  const tenders = await tenderRepo.listByProject(projects[0].id);
  console.log("Tenders count:", tenders.length);
  for (const t of tenders) {
    console.log("Tender:", { id: t.id, category: t.category, status: t.status, selectedProposalId: t.selectedProposalId });
  }
}

run().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
