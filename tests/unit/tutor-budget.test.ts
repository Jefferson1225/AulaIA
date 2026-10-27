import { describe, expect, it } from "vitest";
import { estimateTutorCost, reserveTutorCost, summarizeTutorMetrics } from "../../src/application/tutor-metrics";

describe("Consumo y métricas del tutor", () => {
  it("estima el costo con la tarifa conservadora y reserva más que una respuesta breve", () => {
    expect(estimateTutorCost(1000, 200)).toBeCloseTo(0.00054, 8);
    expect(reserveTutorCost([{ role: "user", content: "¿Qué es una variable?" }])).toBeGreaterThan(0.0006144);
  });
  it("separa fallos, latencia de respuestas y valoraciones sin inventar denominadores", () => {
    const metrics = summarizeTutorMetrics([
      { status: "succeeded", latency_ms: 1000, prompt_tokens: 100, completion_tokens: 20, cost_usd: 0.000054, feedback: "positive" },
      { status: "succeeded", latency_ms: 3000, prompt_tokens: 200, completion_tokens: 40, cost_usd: 0.000108, feedback: null },
      { status: "failed", latency_ms: 500, prompt_tokens: null, completion_tokens: null, cost_usd: 0.001, feedback: null },
    ]);
    expect(metrics).toMatchObject({ total: 3, succeeded: 2, failed: 1, pending: 0, meanLatencyMs: 2000, promptTokens: 300, completionTokens: 60, rated: 1, positive: 1 });
    expect(summarizeTutorMetrics([]).meanLatencyMs).toBeNull();
  });
});
