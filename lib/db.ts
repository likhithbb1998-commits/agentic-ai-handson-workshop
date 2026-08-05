import { promises as fs, existsSync, mkdirSync, copyFileSync } from "node:fs";
import path from "node:path";

// Writable storage directory for Vercel Serverless & Local execution
const isVercel = Boolean(process.env.VERCEL);
const sourceDirectory = path.join(process.cwd(), "data");
const targetDirectory = isVercel ? "/tmp/workshop_data" : sourceDirectory;

const inMemoryCache = new Map<string, unknown>();
const writeQueues = new Map<string, Promise<unknown>>();

function ensureTargetDirectory() {
  if (isVercel && !existsSync(targetDirectory)) {
    try {
      mkdirSync(targetDirectory, { recursive: true });
    } catch {
      // Fallback to in-memory if directory creation fails
    }
  }
}

export async function readJson<T>(file: string): Promise<T> {
  ensureTargetDirectory();
  const targetPath = path.join(targetDirectory, file);
  const sourcePath = path.join(sourceDirectory, file);

  // 1. Return from in-memory cache if present
  if (inMemoryCache.has(file)) {
    return inMemoryCache.get(file) as T;
  }

  try {
    // 2. Read from writable target path (or copy from source if missing)
    if (isVercel && !existsSync(targetPath) && existsSync(sourcePath)) {
      copyFileSync(sourcePath, targetPath);
    }
    const filePath = isVercel && existsSync(targetPath) ? targetPath : sourcePath;
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as T;
    inMemoryCache.set(file, parsed);
    return parsed;
  } catch {
    // 3. Fallback to source directory
    const raw = await fs.readFile(sourcePath, "utf8");
    const parsed = JSON.parse(raw) as T;
    inMemoryCache.set(file, parsed);
    return parsed;
  }
}

export async function writeJson<T>(file: string, value: T): Promise<void> {
  ensureTargetDirectory();
  inMemoryCache.set(file, value);
  const targetPath = path.join(targetDirectory, file);
  const previous = writeQueues.get(file) ?? Promise.resolve();

  const next = previous.then(async () => {
    try {
      const temporary = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
      await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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
