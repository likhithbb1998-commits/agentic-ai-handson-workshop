import { redirect } from "next/navigation";
import { getIdentity } from "@/lib/auth";
import { StudentLoginForm } from "@/components/login-forms";
export default async function StudentLoginPage() { const identity = await getIdentity(); if (identity?.role === "student") redirect("/student"); return <StudentLoginForm />; }
