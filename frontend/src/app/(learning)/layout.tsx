import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSupabaseConfig } from "@aulaia/backend/infrastructure/supabase/config";
import { requireStudentForRender } from "@/app/render-data";
import "../../presentation/content.css";
import "../../presentation/learning.css";
import "../../presentation/tutor.css";
import "../../presentation/assessments.css";

export const dynamic = "force-dynamic";

export default async function LearningLayout({ children }: { children: ReactNode }) {
  if (!getSupabaseConfig()) {
    if (process.env.NODE_ENV !== "development") redirect("/login");
    return children;
  }

  await requireStudentForRender();
  return children;
}
