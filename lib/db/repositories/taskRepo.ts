import { nanoid } from "nanoid";
import type { TimelineTask } from "@/types/marketplace";
import type { Timeline } from "@/types/domain";
import { localStore } from "@/lib/db/localStore";
import { isLocalMode } from "./utils";

const COLLECTION = "timeline_tasks";

async function getFirestoreCol() {
  const { getDb } = await import("@/lib/db/firebase");
  return getDb().collection(COLLECTION);
}

export const taskRepo = {
  async create(data: Omit<TimelineTask, "id" | "createdAt" | "updatedAt">): Promise<TimelineTask> {
    const id = nanoid(12);
    const now = new Date().toISOString();
    const task: TimelineTask = { ...data, id, createdAt: now, updatedAt: now };
    if (isLocalMode()) {
      await localStore.set(COLLECTION, id, task);
      return task;
    }
    const col = await getFirestoreCol();
    await col.doc(id).set(task);
    return task;
  },

  async listByProject(projectId: string): Promise<TimelineTask[]> {
    if (isLocalMode()) {
      const all = await localStore.all<TimelineTask>(COLLECTION);
      return all.filter((t) => t.projectId === projectId).sort((a, b) => b.monthsBeforeWedding - a.monthsBeforeWedding);
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).get();
    return snap.docs
      .map((d) => d.data() as TimelineTask)
      .sort((a, b) => b.monthsBeforeWedding - a.monthsBeforeWedding);
  },

  async get(id: string): Promise<TimelineTask | null> {
    if (isLocalMode()) return localStore.get<TimelineTask>(COLLECTION, id);
    const col = await getFirestoreCol();
    const doc = await col.doc(id).get();
    return doc.exists ? (doc.data() as TimelineTask) : null;
  },

  async update(id: string, data: Partial<TimelineTask>): Promise<TimelineTask> {
    const now = new Date().toISOString();
    if (isLocalMode()) {
      return localStore.update<TimelineTask>(COLLECTION, id, { ...data, updatedAt: now });
    }
    const col = await getFirestoreCol();
    await col.doc(id).update({ ...data, updatedAt: now });
    const doc = await col.doc(id).get();
    return doc.data() as TimelineTask;
  },

  async deleteByProject(projectId: string): Promise<void> {
    if (isLocalMode()) {
      const all = await localStore.all<TimelineTask>(COLLECTION);
      const toDelete = all.filter((t) => t.projectId === projectId);
      await Promise.all(toDelete.map((t) => localStore.delete(COLLECTION, t.id)));
      return;
    }
    const col = await getFirestoreCol();
    const snap = await col.where("projectId", "==", projectId).get();
    const batch = col.firestore.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  },

  async delete(id: string): Promise<void> {
    if (isLocalMode()) {
      await localStore.delete(COLLECTION, id);
      return;
    }
    const col = await getFirestoreCol();
    await col.doc(id).delete();
  },

  async createFromTimeline(projectId: string, timeline: Timeline): Promise<TimelineTask[]> {
    await this.deleteByProject(projectId);
    const now = new Date().toISOString();
    const tasks: TimelineTask[] = [];
    for (const milestone of timeline.milestones || []) {
      for (const title of milestone.tasks || []) {
        const task: TimelineTask = {
          id: nanoid(12),
          projectId,
          title,
          monthsBeforeWedding: milestone.monthsBeforeWedding,
          completed: false,
          createdAt: now,
          updatedAt: now,
        };
        tasks.push(task);
      }
    }
    if (isLocalMode()) {
      await Promise.all(tasks.map((t) => localStore.set(COLLECTION, t.id, t)));
      return tasks;
    }
    const col = await getFirestoreCol();
    await Promise.all(tasks.map((t) => col.doc(t.id).set(t)));
    return tasks;
  },
};
