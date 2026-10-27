import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { parseAssessmentId } from "../../../../../application/assessments";
import { requireContentAdmin } from "../../../../../infrastructure/supabase/admin-access";
import { getManagedAssessment } from "../../../../../infrastructure/supabase/admin-assessment-repository";
import { AdminAssessmentDetailView } from "../../../../../presentation/views/AdminAssessmentDetailView";
import { saveAssessmentAction,saveQuestionAction,deleteQuestionAction,publishAssessmentAction,deleteAssessmentAction } from "../actions";
export const metadata: Metadata = { title: "Editar evaluación · AulaIA" };

export default async function AdminAssessmentPage({ params,searchParams }: { params: Promise<{ evaluacion: string }>; searchParams: Promise<{ estado?: string }> }) {
  const client = await requireContentAdmin();
  const { evaluacion } = await params;
  let id: string;
  try { id=parseAssessmentId(evaluacion); } catch { notFound(); }
  const [assessment,query] = await Promise.all([getManagedAssessment(client,id),searchParams]);
  if (!assessment) notFound();
  return <AdminAssessmentDetailView assessment={assessment} status={query.estado} actions={{ save:saveAssessmentAction,saveQuestion:saveQuestionAction,deleteQuestion:deleteQuestionAction,publish:publishAssessmentAction,delete:deleteAssessmentAction }} />;
}
