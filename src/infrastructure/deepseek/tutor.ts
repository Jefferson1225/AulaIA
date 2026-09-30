export async function askDeepSeek(system: string, question: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DeepSeek no está configurado.");

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-flash",
      messages: [{ role: "system", content: system }, { role: "user", content: question }],
      max_tokens: 512,
      stream: false,
    }),
    signal: AbortSignal.timeout(30000),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("DeepSeek no pudo responder.");
  const data: unknown = await response.json();
  const answer = (data as { choices?: { message?: { content?: string } }[] }).choices?.[0]?.message?.content;
  if (!answer?.trim()) throw new Error("DeepSeek devolvió una respuesta vacía.");
  return answer.trim();
}
