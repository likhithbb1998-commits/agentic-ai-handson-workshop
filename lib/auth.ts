import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type SessionIdentity = { role: "trainer" } | { role: "student"; studentId: string };

const cookieName = "liuantx_session";
const secret = process.env.SESSION_SECRET || "local-workshop-change-me-before-public-deploy";

function signature(payload: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(identity: SessionIdentity) {
  const payload = Buffer.from(JSON.stringify({ ...identity, exp: Date.now() + 1000 * 60 * 60 * 24 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifySessionToken(token?: string): SessionIdentity | null {
  if (!token) return null;
  const [payload, provided] = token.split(".");
  if (!payload || !provided) return null;
  const expected = signature(payload);
  if (provided.length !== expected.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionIdentity & { exp: number };
    if (parsed.exp < Date.now() || !["trainer", "student"].includes(parsed.role)) return null;
    return parsed.role === "trainer" ? { role: "trainer" } : { role: "student", studentId: parsed.studentId };
  } catch {
    return null;
  }
}

export async function getIdentity() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  return verifySessionToken(token);
}

export async function setIdentity(identity: SessionIdentity) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, createSessionToken(identity), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

export async function clearIdentity() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export function trainerCredentialsValid(username: string, password: string) {
  const configuredUsername = process.env.TRAINER_USERNAME || "likhith";
  const configuredPassword = process.env.TRAINER_PASSWORD || "12281998";
  const a = Buffer.from(username);
  const b = Buffer.from(configuredUsername);
  const c = Buffer.from(password);
  const d = Buffer.from(configuredPassword);
  return a.length === b.length && c.length === d.length && timingSafeEqual(a, b) && timingSafeEqual(c, d);
}
