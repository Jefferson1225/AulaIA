import type { Metadata } from "next";
import { LoginView } from "../../../presentation/views/LoginView";
import { getSupabaseConfig } from "@aulaia/backend/infrastructure/supabase/config";
import { signIn } from "@aulaia/backend/interfaces/actions/auth";

export const metadata: Metadata = { title: "Acceso · AulaIA" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const configured = Boolean(getSupabaseConfig());
  return <LoginView configured={configured} demoAvailable={!configured && process.env.NODE_ENV === "development"} status={estado} action={configured ? signIn : undefined} />;
}
