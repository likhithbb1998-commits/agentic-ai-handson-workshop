import { NextResponse } from "next/server";
import { z } from "zod";
import { setIdentity } from "@/lib/auth";
import { broadcast, upsertStudent } from "@/lib/workshop";

const gmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
const schema = z.object({
  usn: z.string().trim().min(3).max(24).regex(/^[A-Za-z0-9_-]+$/),
  name: z.string().trim().min(2).max(80).regex(/^[\p{L}\p{M} .'-]+$/u),
  email: z.string().trim().toLowerCase().email().regex(gmail, "Use a Gmail address."),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid student details." }, { status: 400 });
  const student = await upsertStudent({ ...parsed.data, usn: parsed.data.usn.toUpperCase(), name: parsed.data.name.replace(/\s+/g, " ") });
  await setIdentity({ role: "student", studentId: student.id });
  broadcast("STUDENT_JOINED", { studentId: student.id });
  return NextResponse.json({ ok: true, studentId: student.id });
}
