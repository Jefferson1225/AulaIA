import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "../../infrastructure/supabase/config";
import { createSupabaseServerClient } from "../../infrastructure/supabase/server";

export const dynamic = "force-dynamic";

export default async function LearningLayout({ children }: { children: ReactNode }) {
  if (!getSupabaseConfig()) {
    if (process.env.NODE_ENV !== "development") redirect("/login");
    return children;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return children;
}
