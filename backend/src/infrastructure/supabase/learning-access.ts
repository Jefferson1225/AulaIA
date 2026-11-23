import { redirect } from "next/navigation";
import { getSupabaseConfig } from "./config";
import { createSupabaseServerClient } from "./server";

export async function requireLearningUser() {
  if (!getSupabaseConfig()) redirect("/login");
  const client = await createSupabaseServerClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/login");
  return { client, user };
}
