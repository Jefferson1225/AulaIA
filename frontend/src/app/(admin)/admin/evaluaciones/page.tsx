import type { Metadata } from "next";
import { requireAdminForRender } from "@/app/render-data";
import { listManagedAssessments } from "@aulaia/backend/infrastructure/supabase/admin-assessment-repository";
import { listManagedCourses } from "@aulaia/backend/infrastructure/supabase/admin-content-repository";
import { AdminAssessmentsView } from "../../../../presentation/views/AdminAssessmentsView";
import { saveAssessmentAction } from "@aulaia/backend/interfaces/actions/admin-assessments";

export const metadata: Metadata = { title: "Evaluaciones · AulaIA" };
export default async function AdminAssessmentsPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const client = await requireAdminForRender();
  const [assessments,courses,query] = await Promise.all([listManagedAssessments(client),listManagedCourses(client),searchParams]);
  return <AdminAssessmentsView assessments={assessments} courses={courses} saveAction={saveAssessmentAction} status={query.estado} />;
}
