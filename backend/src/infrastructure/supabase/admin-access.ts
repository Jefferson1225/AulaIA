import { redirect } from "next/navigation";
import { canManageContent } from "../../application/content-management";
import type { UserRole } from "../../domain/profile";
import { getSupabaseConfig } from "./config";
import { createSupabaseServerClient } from "./server";

export async function requireContentAdmin() {
  if (!getSupabaseConfig()) redirect("/login");
  const client = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user) redirect("/login");

  const { data: profile, error: profileError } = await client.from("profiles")
    .select("role").eq("id", user.id).maybeSingle();
  if (profileError || !canManageContent(profile?.role as UserRole | undefined)) redirect("/inicio");
  return client;
}
