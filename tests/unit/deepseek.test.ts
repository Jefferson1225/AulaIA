// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { askDeepSeek } from "../../src/infrastructure/deepseek/tutor";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("Proveedor DeepSeek", () => {
  it("envía historial sin razonamiento y conserva uso real y modelo de la respuesta", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-only");
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      expect(body.thinking).toEqual({ type: "disabled" });
      expect(body.max_tokens).toBe(512);
      expect(body.messages.map((m: {role: string}) => m.role)).toEqual(["system", "user", "assistant", "user"]);
      return Response.json({ model: "deepseek-v4.1-flash-1017", choices: [{ finish_reason: "stop", message: { content: " Una variable guarda un valor. " } }], usage: { prompt_tokens: 120, completion_tokens: 20, prompt_cache_hit_tokens: 64 } });
    });
    const result = await askDeepSeek("Tutor", "¿Otro ejemplo?", [{ role: "user", content: "¿Variable?" }, { role: "assistant", content: "Un nombre." }]);
    expect(result).toMatchObject({ answer: "Una variable guarda un valor.", model: "deepseek-v4.1-flash-1017", promptTokens: 120, completionTokens: 20, cachedTokens: 64, truncated: false });
  });
  it("informa saldo insuficiente sin revelar el cuerpo del proveedor", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "test-only");
    vi.stubGlobal("fetch", async () => new Response("secret-provider-body", { status: 402 }));
    await expect(askDeepSeek("Tutor", "Hola")).rejects.toMatchObject({ code: "balance", message: "El servicio de IA no tiene saldo disponible." });
  });
});
