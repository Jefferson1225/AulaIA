import type { TutorMessage, TutorMetricRow } from "../domain/tutor";

// USD / millón de tokens, tarifa máxima de Flash consultada el 26/10/2026.
// Se ignora el descuento por caché y horario para no subestimar el gasto.
export function estimateTutorCost(promptTokens: number, completionTokens: number) {
  return (promptTokens * 0.30 + completionTokens * 1.20) / 1_000_000;
}

export function reserveTutorCost(messages: { role: string; content: string }[]) {
  const inputUpperBound = new TextEncoder().encode(JSON.stringify(messages)).length + messages.length * 32 + 256;
  return Math.ceil(estimateTutorCost(inputUpperBound, 512) * 100_000_000) / 100_000_000;
}

export function boundedTutorHistory(turns: { question: string; answer: string | null; status: string }[]): TutorMessage[] {
  return turns.filter(turn => turn.status === "succeeded" && turn.answer).slice(-3).flatMap(turn => [
    { role: "user" as const, content: turn.question.slice(0, 1000) },
    { role: "assistant" as const, content: turn.answer!.slice(0, 2500) },
  ]);
}

export function summarizeTutorMetrics(rows: TutorMetricRow[]) {
  const successful = rows.filter(row => row.status === "succeeded");
  const timed = successful.filter(row => row.latency_ms !== null);
  return {
    total: rows.length, succeeded: successful.length,
    failed: rows.filter(row => row.status === "failed").length,
    pending: rows.filter(row => row.status === "pending").length,
    meanLatencyMs: timed.length ? timed.reduce((sum, row) => sum + row.latency_ms!, 0) / timed.length : null,
    promptTokens: rows.reduce((sum, row) => sum + (row.prompt_tokens ?? 0), 0),
    completionTokens: rows.reduce((sum, row) => sum + (row.completion_tokens ?? 0), 0),
    estimatedCostUsd: rows.reduce((sum, row) => sum + Number(row.cost_usd), 0),
    rated: successful.filter(row => row.feedback !== null).length,
    positive: successful.filter(row => row.feedback === "positive").length,
    negative: successful.filter(row => row.feedback === "negative").length,
  };
}
