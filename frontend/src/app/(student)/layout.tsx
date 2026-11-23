import type { ReactNode } from "react";
import { StudentShell } from "../../presentation/components/StudentShell";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@aulaia/backend/infrastructure/supabase/config";
import { signOut } from "@aulaia/backend/interfaces/actions/auth";
import { getProfileForRender, requireStudentForRender } from "@/app/render-data";
import "../../presentation/learning.css";
import "../../presentation/assessments.css";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  if (!getSupabaseConfig()) {
    if (process.env.NODE_ENV !== "development") redirect("/login");
    return <StudentShell demo>{children}</StudentShell>;
  }

  const { user } = await requireStudentForRender();
  const profile = await getProfileForRender(user.id);
  return <StudentShell profile={profile} email={user.email} signOutAction={signOut}>{children}</StudentShell>;
}
