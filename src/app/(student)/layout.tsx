import type { ReactNode } from "react";
import { StudentShell } from "../../presentation/components/StudentShell";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "../../infrastructure/supabase/config";
import { createSupabaseServerClient } from "../../infrastructure/supabase/server";
import { getProfile } from "../../infrastructure/supabase/profile-repository";
import { signOut } from "../(auth)/actions";
import "../../presentation/learning.css";

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
