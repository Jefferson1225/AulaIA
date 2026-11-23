import type { Profile, UserRole } from "../../domain/profile";
import { createSupabaseServerClient } from "./server";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("id, full_name, role").eq("id", userId).maybeSingle();
  if (error) throw new Error("No se pudo consultar el perfil.");
  if (!data) return null;
  return { id: data.id, fullName: data.full_name, role: data.role as UserRole };
}
