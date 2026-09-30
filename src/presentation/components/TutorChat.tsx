"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

export function TutorChat({ courseSlug, lessonSlug, lessonTitle }: { courseSlug: string; lessonSlug: string; lessonTitle: string }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;
    setQuestion("");
    setError("");
    setMessages((current) => [...current, { role: "user", text: cleanQuestion }]);
    setLoading(true);
    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, lessonSlug, question: cleanQuestion }),
      });
      const data: { answer?: string; error?: string } = await response.json();
      if (!response.ok || !data.answer) throw new Error(data.error || "No pudimos obtener una respuesta.");
      setMessages((current) => [...current, { role: "assistant", text: data.answer! }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos obtener una respuesta.");
    } finally {
      setLoading(false);
    }
  }

  return <aside className="tutor-panel">
    <div className="tutor-heading"><span className="tutor-icon"><Sparkles size={21} /></span><div><strong>Tutor IA</strong><small>Contexto: {lessonTitle}</small></div></div>
    <div className="tutor-conversation" aria-live="polite">
      {messages.length === 0 && <div className="tutor-intro"><MessageCircle size={20} /><p>Pregunta sobre esta lección. El Tutor IA usará su contenido para ayudarte.</p></div>}
      {messages.map((message, index) => <div key={index} className={`message ${message.role === "user" ? "message-user" : "message-ai"}`}><span>{message.role === "user" ? "TÚ" : "TUTOR IA"}</span>{message.text}</div>)}
      {loading && <p className="tutor-wait">Preparando respuesta…</p>}
    </div>
    <form className="tutor-bottom" onSubmit={submit}>
      <label htmlFor="tutor-question">Pregunta al Tutor IA</label>
      <div className="tutor-input-row"><input id="tutor-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1000} placeholder="Escribe tu pregunta…" disabled={loading} /><button type="submit" disabled={loading || !question.trim()}>Enviar</button></div>
      {error && <p role="alert">{error}</p>}
    </form>
  </aside>;
}
