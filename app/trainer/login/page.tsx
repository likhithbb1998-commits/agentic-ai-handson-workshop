import { redirect } from "next/navigation";
import { getIdentity } from "@/lib/auth";
import { TrainerLoginForm } from "@/components/login-forms";
export default async function TrainerLoginPage() { const identity = await getIdentity(); if (identity?.role === "trainer") redirect("/trainer"); return <TrainerLoginForm />; }
