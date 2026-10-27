import type { Metadata } from "next";
import { requireLearningUser } from "../../../infrastructure/supabase/learning-access";
import { createAssessmentRepository } from "../../../infrastructure/supabase/assessment-repository";
import { AssessmentHistoryView } from "../../../presentation/views/AssessmentHistoryView";
export const metadata: Metadata = { title: "Mis resultados · AulaIA" };

export default async function ResultsPage() {
  const {client,user}=await requireLearningUser();
  const attempts=await createAssessmentRepository(client,user.id).listAttempts();
  return <AssessmentHistoryView attempts={attempts} />;
}
