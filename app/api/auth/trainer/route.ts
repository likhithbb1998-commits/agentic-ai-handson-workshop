import { NextResponse } from "next/server";
import { z } from "zod";
import { setIdentity, trainerCredentialsValid } from "@/lib/auth";

const schema = z.object({ username: z.string().min(1).max(80), password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !trainerCredentialsValid(parsed.data.username, parsed.data.password)) {
    return NextResponse.json({ error: "Invalid trainer credentials." }, { status: 401 });
  }
  await setIdentity({ role: "trainer" });
  return NextResponse.json({ ok: true });
}
