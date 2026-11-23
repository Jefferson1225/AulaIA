import type { ReactNode } from "react";
import { StudentShell } from "../../presentation/components/StudentShell";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@aulaia/backend/infrastructure/supabase/config";
import { createSupabaseServerClient } from "@aulaia/backend/infrastructure/supabase/server";
import { getProfile } from "@aulaia/backend/infrastructure/supabase/profile-repository";
import { signOut } from "@aulaia/backend/interfaces/actions/auth";
import "../../presentation/learning.css";
import "../../presentation/assessments.css";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  if (!getSupabaseConfig()) {
    if (process.env.NODE_ENV !== "development") redirect("/login");
    return <StudentShell demo>{children}</StudentShell>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const profile = await getProfile(user.id);
  return <StudentShell profile={profile} email={user.email} signOutAction={signOut}>{children}</StudentShell>;
}
