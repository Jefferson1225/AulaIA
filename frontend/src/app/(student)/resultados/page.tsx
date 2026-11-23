import type { Metadata } from "next";
import { requireStudentForRender } from "@/app/render-data";
import { createAssessmentRepository } from "@aulaia/backend/infrastructure/supabase/assessment-repository";
import { AssessmentHistoryView } from "../../../presentation/views/AssessmentHistoryView";
export const metadata: Metadata = { title: "Mis resultados · AulaIA" };

export default async function ResultsPage() {
  const {client,user}=await requireStudentForRender();
  const attempts=await createAssessmentRepository(client,user.id).listAttempts();
  return <AssessmentHistoryView attempts={attempts} />;
}
