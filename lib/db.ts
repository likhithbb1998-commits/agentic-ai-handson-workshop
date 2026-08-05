import { promises as fs, existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

// Writable storage directory for Vercel Serverless & Local execution
const isVercel = Boolean(process.env.VERCEL);
const sourceDirectory = path.join(process.cwd(), "data");
const targetDirectory = isVercel ? "/tmp/workshop_data" : sourceDirectory;

// Attach cache to globalThis so state persists across serverless executions & hot reloads
const globalStore = globalThis as unknown as {
  __WORKSHOP_DB_CACHE__?: Map<string, unknown>;
  __WORKSHOP_WRITE_QUEUES__?: Map<string, Promise<unknown>>;
};

if (!globalStore.__WORKSHOP_DB_CACHE__) {
  globalStore.__WORKSHOP_DB_CACHE__ = new Map<string, unknown>();
}
if (!globalStore.__WORKSHOP_WRITE_QUEUES__) {
  globalStore.__WORKSHOP_WRITE_QUEUES__ = new Map<string, Promise<unknown>>();
}

const inMemoryCache = globalStore.__WORKSHOP_DB_CACHE__;
const writeQueues = globalStore.__WORKSHOP_WRITE_QUEUES__;

function ensureTargetDirectory() {
  if (isVercel && !existsSync(targetDirectory)) {
    try {
      mkdirSync(targetDirectory, { recursive: true });
    } catch {
      // Ignore directory creation errors
    }
  }
}

export async function readJson<T>(file: string): Promise<T> {
  ensureTargetDirectory();
  const targetPath = path.join(targetDirectory, file);
  const sourcePath = path.join(sourceDirectory, file);

  // 1. Return from global in-memory cache if present
  if (inMemoryCache.has(file)) {
    return inMemoryCache.get(file) as T;
  }

  try {
    // 2. Read from writable target path if available
    if (isVercel && existsSync(targetPath)) {
      const raw = readFileSync(targetPath, "utf8");
      const parsed = JSON.parse(raw) as T;
      inMemoryCache.set(file, parsed);
      return parsed;
    }

    // 3. Otherwise initialize target path from source data if target is missing
    if (isVercel && !existsSync(targetPath) && existsSync(sourcePath)) {
      copyFileSync(sourcePath, targetPath);
    }

    const filePath = isVercel && existsSync(targetPath) ? targetPath : sourcePath;
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as T;
    inMemoryCache.set(file, parsed);
    return parsed;
  } catch {
    // 4. Fallback read from source directory
    const raw = readFileSync(sourcePath, "utf8");
    const parsed = JSON.parse(raw) as T;
    inMemoryCache.set(file, parsed);
    return parsed;
  }
}

export async function writeJson<T>(file: string, value: T): Promise<void> {
  ensureTargetDirectory();
  // Synchronously update in-memory cache
  inMemoryCache.set(file, value);

  const targetPath = path.join(targetDirectory, file);
  const previous = writeQueues.get(file) ?? Promise.resolve();

  const next = previous.then(async () => {
    try {
      const temporary = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
      writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
      await fs.rename(temporary, targetPath);
    } catch {
      // In-memory fallback if file system is read-only
    }
  });

  writeQueues.set(file, next.catch(() => undefined));
  await next;
}

export async function updateJson<T>(file: string, change: (current: T) => T | Promise<T>): Promise<T> {
  const current = await readJson<T>(file);
  const updated = await change(current);
  await writeJson(file, updated);
  return updated;
}
