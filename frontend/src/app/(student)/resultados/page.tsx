import type { Metadata } from "next";
import { requireLearningUser } from "@aulaia/backend/infrastructure/supabase/learning-access";
import { createAssessmentRepository } from "@aulaia/backend/infrastructure/supabase/assessment-repository";
import { AssessmentHistoryView } from "../../../presentation/views/AssessmentHistoryView";
export const metadata: Metadata = { title: "Mis resultados · AulaIA" };

export default async function ResultsPage() {
  const {client,user}=await requireLearningUser();
  const attempts=await createAssessmentRepository(client,user.id).listAttempts();
  return <AssessmentHistoryView attempts={attempts} />;
}
