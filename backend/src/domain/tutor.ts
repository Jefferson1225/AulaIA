export interface TutorMessage { role: "user" | "assistant"; content: string }
export type TutorFeedback = "positive" | "negative";
export interface TutorTurn {
  id: string;
  conversation_id: string;
  question: string;
  answer: string | null;
  status: "pending" | "succeeded" | "failed";
  feedback: TutorFeedback | null;
  feedback_comment: string | null;
  created_at: string;
  truncated: boolean;
}
export interface TutorReply {
  answer: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cachedTokens: number;
  truncated: boolean;
}
export interface TutorMetricRow {
  status: string;
  latency_ms: number | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  cost_usd: number;
  feedback: string | null;
}
