import type { Metadata } from "next";
import { requireContentAdmin } from "../../../../infrastructure/supabase/admin-access";
import { listManagedAssessments } from "../../../../infrastructure/supabase/admin-assessment-repository";
import { listManagedCourses } from "../../../../infrastructure/supabase/admin-content-repository";
import { AdminAssessmentsView } from "../../../../presentation/views/AdminAssessmentsView";
import { saveAssessmentAction } from "./actions";

export const metadata: Metadata = { title: "Evaluaciones · AulaIA" };
export default async function AdminAssessmentsPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const client = await requireContentAdmin();
  const [assessments,courses,query] = await Promise.all([listManagedAssessments(client),listManagedCourses(client),searchParams]);
  return <AdminAssessmentsView assessments={assessments} courses={courses} saveAction={saveAssessmentAction} status={query.estado} />;
}
