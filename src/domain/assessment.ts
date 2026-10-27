export interface Assessment {
  id: string;
  courseSlug: string;
  title: string;
  description: string;
  passingScore: number;
  isPublished: boolean;
  version: number;
}

/** Los datos para estudiantes nunca incluyen la alternativa correcta. */
export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
  position: number;
}

export interface ManagedQuestion extends AssessmentQuestion { correctOption: number }
export interface ManagedAssessment extends Assessment { questions: ManagedQuestion[]; hasAttempts: boolean }
export interface AssessmentInput { id?: string; courseSlug: string; title: string; description: string; passingScore: number }
export interface QuestionInput { id?: string; assessmentId: string; prompt: string; options: string[]; correctOption: number; position: number }
export interface AssessmentSubmission { assessmentId: string; requestId: string; version: number; answers: { questionId: string; optionIndex: number }[] }

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  courseSlug: string;
  assessmentTitle: string;
  score: number;
  passingScore: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  submittedAt: string;
  answers: { questionId: string; prompt: string; selectedOption: string; correct: boolean }[];
}

export interface AssessmentRepository {
  listPublished(courseSlug: string): Promise<Assessment[]>;
  getPublished(id: string, courseSlug: string): Promise<Assessment | null>;
  getQuestions(id: string): Promise<AssessmentQuestion[]>;
  listAttempts(id?: string): Promise<AssessmentAttempt[]>;
  getAttempt(id: string, assessmentId: string, courseSlug: string): Promise<AssessmentAttempt | null>;
  submit(input: AssessmentSubmission): Promise<string>;
}
