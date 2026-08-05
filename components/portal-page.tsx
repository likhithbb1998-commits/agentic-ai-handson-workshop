import { redirect } from "next/navigation";
import { getIdentity } from "@/lib/auth";
import { StudentApp } from "@/components/student-app";
import { TrainerApp } from "@/components/trainer-app";

export async function StudentPortalPage() { const identity = await getIdentity(); if (identity?.role !== "student") redirect("/student/login"); return <StudentApp />; }
export async function TrainerPortalPage() { const identity = await getIdentity(); if (identity?.role !== "trainer") redirect("/trainer/login"); return <TrainerApp />; }
