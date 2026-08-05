import { NextResponse } from "next/server";
import { z } from "zod";
import { getIdentity } from "@/lib/auth";
import { broadcast, updateSession } from "@/lib/workshop";
import { executePython, forbiddenPython } from "@/lib/python-runner";

const schema = z.object({ code: z.string().min(1).max(10000) });

export async function POST(request: Request) {
  const identity = await getIdentity();
  if (!identity) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || forbiddenPython.test(parsed.data.code)) return NextResponse.json({ error: "This runner only accepts safe workshop Python without un-sandboxed process or socket access." }, { status: 400 });
  const output = await executePython(parsed.data.code);
  if (identity.role === "trainer") { await updateSession((session) => ({ ...session, codeOutput: output })); broadcast("CODE_EXECUTED", output); }
  return NextResponse.json(output);
}
