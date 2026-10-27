import { z } from "zod";
import type { AssessmentInput, AssessmentSubmission, QuestionInput } from "../domain/assessment";

export const parseAssessmentId = (value: unknown): string => z.uuid().parse(value);
const slug = z.string().trim().min(1).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const assessmentSchema = z.object({
  id: z.uuid().optional(), courseSlug: slug, title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(2000), passingScore: z.coerce.number().int().min(1).max(20),
});
const questionSchema = z.object({
  id: z.uuid().optional(), assessmentId: z.uuid(), prompt: z.string().trim().min(3).max(2000),
  options: z.array(z.string().trim().min(1).max(500)).length(4),
  correctOption: z.coerce.number().int().min(0).max(3), position: z.coerce.number().int().min(1).max(10000),
});
const submissionSchema = z.object({
  assessmentId: z.uuid(), requestId: z.uuid(), version: z.coerce.number().int().positive(),
  answers: z.array(z.object({ questionId: z.uuid(), optionIndex: z.number().int().min(0).max(3) })).min(1).max(50),
}).refine((input) => new Set(input.answers.map((answer) => answer.questionId)).size === input.answers.length, "No se puede responder dos veces la misma pregunta.");

export const parseAssessmentInput = (value: unknown): AssessmentInput => assessmentSchema.parse(value);
export const parseQuestionInput = (value: unknown): QuestionInput => questionSchema.parse(value);
export const parseSubmission = (value: unknown): AssessmentSubmission => submissionSchema.parse(value);

export function submissionFromForm(form: FormData): AssessmentSubmission {
  const answers = Array.from(form.entries()).filter(([key]) => key.startsWith("answer-"))
    .map(([key, value]) => ({ questionId: key.slice(7), optionIndex: typeof value === "string" && /^[0-3]$/.test(value) ? Number(value) : NaN }));
  return parseSubmission({ assessmentId: form.get("assessmentId"), requestId: form.get("requestId"), version: form.get("version"), answers });
}
