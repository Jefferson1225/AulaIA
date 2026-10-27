import type { TutorMessage, TutorReply } from "../../domain/tutor";

export class TutorProviderError extends Error {
  constructor(public readonly code: string, message: string) { super(message); }
}

export async function askDeepSeek(system: string, question: string, history: TutorMessage[] = []): Promise<TutorReply> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new TutorProviderError("configuration", "El Tutor IA aún no está configurado.");
  if (process.env.DEEPSEEK_MODEL && process.env.DEEPSEEK_MODEL !== "deepseek-flash") {
    throw new TutorProviderError("configuration", "El modelo configurado no tiene una tarifa validada.");
  }
  let response: Response;
  try {
    response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-flash",
        messages: [{ role: "system", content: system }, ...history, { role: "user", content: question }],
        thinking: { type: "disabled" }, max_tokens: 512, temperature: 0.2, stream: false,
      }),
      signal: AbortSignal.timeout(30000), cache: "no-store",
    });
  } catch {
    throw new TutorProviderError("network", "El servicio tardó demasiado o no está disponible. Inténtalo más tarde.");
  }
  if (!response.ok) {
    if (response.status === 402) throw new TutorProviderError("balance", "El servicio de IA no tiene saldo disponible.");
    if (response.status === 429) throw new TutorProviderError("rate_limit", "El servicio de IA está ocupado. Inténtalo más tarde.");
    throw new TutorProviderError("provider", "No pudimos obtener una respuesta del servicio de IA.");
  }
  const data = await response.json() as {
    model?: string; choices?: { finish_reason?: string; message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number; prompt_cache_hit_tokens?: number };
  };
  const answer = data.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new TutorProviderError("empty", "El servicio devolvió una respuesta vacía.");
  if (!Number.isSafeInteger(data.usage?.prompt_tokens) || !Number.isSafeInteger(data.usage?.completion_tokens) || data.usage!.prompt_tokens! < 0 || data.usage!.completion_tokens! < 0) {
    throw new TutorProviderError("usage", "No se pudo verificar el consumo de la respuesta.");
  }
  return {
    answer, model: data.model ?? "deepseek-flash", promptTokens: data.usage!.prompt_tokens!,
    completionTokens: data.usage!.completion_tokens!, cachedTokens: data.usage?.prompt_cache_hit_tokens ?? 0,
    truncated: data.choices?.[0]?.finish_reason === "length",
  };
}
