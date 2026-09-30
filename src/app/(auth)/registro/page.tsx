import type { Metadata } from "next";
import { getSupabaseConfig } from "../../../infrastructure/supabase/config";
import { LoginView } from "../../../presentation/views/LoginView";
import { signUp } from "../actions";

export const metadata: Metadata = { title: "Registro · AulaIA" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const configured = Boolean(getSupabaseConfig());
  return <LoginView configured={configured} demoAvailable={false} mode="register" status={estado} action={configured ? signUp : undefined} />;
}
