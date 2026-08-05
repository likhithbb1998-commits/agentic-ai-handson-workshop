import { NextResponse } from "next/server";
import { z } from "zod";
import { getIdentity } from "@/lib/auth";
import { askOpenRouter, getOpenRouterStatus } from "@/lib/openrouter";

const schema = z.object({ prompt: z.string().min(2).max(4000) });

export async function GET() {
  const identity = await getIdentity();
  if (identity?.role !== "trainer") return NextResponse.json({ error: "Trainer access required." }, { status: 403 });
  return NextResponse.json(getOpenRouterStatus(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const identity = await getIdentity();
  if (identity?.role !== "trainer") return NextResponse.json({ error: "Trainer access required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid prompt." }, { status: 400 });
  try {
    return NextResponse.json(await askOpenRouter(parsed.data.prompt));
  } catch (cause) {
    return NextResponse.json({ error: cause instanceof Error ? cause.message : "The model request failed." }, { status: 503 });
  }
}
