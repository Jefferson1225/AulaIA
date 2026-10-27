import type { Assessment, AssessmentAttempt, AssessmentQuestion } from "../../src/domain/assessment";
export const exampleAssessment: Assessment = {
  id: "ea100000-0000-4000-8000-000000000001", courseSlug: "fundamentos-python", title: "Variables y tipos de datos", description: "Comprueba lo aprendido", passingScore: 12, isPublished: true, version: 1,
};
export const exampleQuestions: AssessmentQuestion[] = [{ id: "ea200000-0000-4000-8000-000000000001", prompt: "¿Qué tipo es 24?", options: ["int", "str", "bool", "float"], position: 1 }];
export const exampleAttempt: AssessmentAttempt = {
  id: "ea300000-0000-4000-8000-000000000001", assessmentId: exampleAssessment.id, courseSlug: exampleAssessment.courseSlug,
  assessmentTitle: exampleAssessment.title, score: 13.33, passingScore: 12, correctCount: 2, totalQuestions: 3, passed: true,
  submittedAt: "2026-10-26T12:00:00Z", answers: [{ questionId: exampleQuestions[0].id, prompt: exampleQuestions[0].prompt, selectedOption: "int", correct: true }],
};
