import { promises as fs } from "node:fs";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");
const writeQueues = new Map<string, Promise<unknown>>();

export async function readJson<T>(file: string): Promise<T> {
  const raw = await fs.readFile(path.join(dataDirectory, file), "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJson<T>(file: string, value: T): Promise<void> {
  const target = path.join(dataDirectory, file);
  const previous = writeQueues.get(file) ?? Promise.resolve();
  const next = previous.then(async () => {
    const temporary = `${target}.${process.pid}.tmp`;
    await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    await fs.rename(temporary, target);
  });
  writeQueues.set(file, next.catch(() => undefined));
  await next;
}

export async function updateJson<T>(file: string, change: (current: T) => T | Promise<T>): Promise<T> {
  const target = path.join(dataDirectory, file);
  const previous = writeQueues.get(file) ?? Promise.resolve();
  let result!: T;
  const next = previous.then(async () => {
    const current = JSON.parse(await fs.readFile(target, "utf8")) as T;
    result = await change(current);
    const temporary = `${target}.${process.pid}.tmp`;
    await fs.writeFile(temporary, `${JSON.stringify(result, null, 2)}\n`, "utf8");
    await fs.rename(temporary, target);
  });
  writeQueues.set(file, next.catch(() => undefined));
  await next;
  return result;
}
