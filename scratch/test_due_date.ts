import { taskRepo } from "../lib/db/repositories/taskRepo";
import { projectRepo } from "../lib/db/repositories/projectRepo";
import { userRepo } from "../lib/db/repositories/userRepo";

async function test() {
  const users = await userRepo.list();
  const couple = users.find((u: any) => u.firstName?.toLowerCase().includes("elisabeth") || u.email?.includes("maxad8908"));
  if (!couple) {
    console.error("Couple not found");
    return;
  }
  const projects = await projectRepo.listByUser(couple.id);
  const projectId = projects[0].id;

  const task = await taskRepo.create({
    projectId,
    title: "Test Essayage Robe",
    monthsBeforeWedding: 3,
    dueDate: "2026-11-18",
    completed: false
  });
  console.log("Created task id:", task.id, "dueDate:", task.dueDate);

  const fetched = await taskRepo.get(task.id);
  console.log("Fetched task dueDate:", fetched?.dueDate);

  // cleanup test task
  await taskRepo.delete(task.id);
  console.log("Cleanup: successfully deleted test task");
}

test().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
