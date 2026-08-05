import { NextResponse } from "next/server";
import { clearIdentity } from "@/lib/auth";

export async function POST() {
  await clearIdentity();
  return NextResponse.json({ ok: true });
}
