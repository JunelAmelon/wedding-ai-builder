import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function filePathFor(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

async function readCollection<T>(collection: string): Promise<Record<string, T>> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(filePathFor(collection), "utf-8");
    return JSON.parse(raw) as Record<string, T>;
  } catch {
    return {};
  }
}

async function writeCollection<T>(collection: string, data: Record<string, T>): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePathFor(collection), JSON.stringify(data, null, 2), "utf-8");
}

export const localStore = {
  async get<T>(collection: string, id: string): Promise<T | null> {
    const data = await readCollection<T>(collection);
    return data[id] ?? null;
  },

  async set<T>(collection: string, id: string, value: T): Promise<void> {
    const data = await readCollection<T>(collection);
    data[id] = value;
    await writeCollection(collection, data);
  },

  async update<T extends object>(collection: string, id: string, partial: Partial<T>): Promise<T> {
    const data = await readCollection<T>(collection);
    const existing = data[id];
    if (!existing) throw new Error(`Document ${id} introuvable dans ${collection}`);
    const merged = { ...existing, ...partial };
    data[id] = merged;
    await writeCollection(collection, data);
    return merged;
  },

  async all<T>(collection: string): Promise<T[]> {
    const data = await readCollection<T>(collection);
    return Object.values(data);
  },

  async findOne<T>(collection: string, predicate: (item: T) => boolean): Promise<T | null> {
    const items = await this.all<T>(collection);
    return items.find(predicate) ?? null;
  },
};
