"use client";

import { FormEvent, useState } from "react";
import type { TutorFeedback, TutorTurn } from "../../domain/tutor";
import { MessageCircle, Sparkles } from "lucide-react";
import Markdown from "react-markdown";

function ResponseFeedback({ turn }: { turn: TutorTurn }) {
  const [feedback, setFeedback] = useState(turn.feedback);
  const [reporting, setReporting] = useState(false);
  const [comment, setComment] = useState(turn.feedback_comment ?? "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  async function save(value: TutorFeedback) {
    setSaving(true); setStatus("");
    try {
      const response = await fetch("/api/tutor", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: turn.id, feedback: value, comment: value === "negative" ? comment : "" }) });
      if (!response.ok) throw new Error("No se pudo guardar la valoración.");
      setFeedback(value); setReporting(false); setStatus("Valoración guardada.");
    } catch { setStatus("No se pudo guardar la valoración. Inténtalo de nuevo."); }
    finally { setSaving(false); }
  }
  return <div className="tutor-feedback">
    <div><button type="button" aria-pressed={feedback === "positive"} disabled={saving} onClick={() => void save("positive")}>Útil</button><button type="button" aria-pressed={feedback === "negative"} disabled={saving} onClick={() => setReporting(!reporting)}>Reportar respuesta</button></div>
    {reporting && <div className="tutor-report"><label htmlFor={`feedback-${turn.id}`}>¿Qué se podría mejorar?</label><textarea id={`feedback-${turn.id}`} maxLength={500} rows={2} value={comment} onChange={event => setComment(event.target.value)} /><button type="button" disabled={saving} onClick={() => void save("negative")}>Guardar reporte</button></div>}
    {status && <small role="status">{status}</small>}
  </div>;
}

export function TutorChat({ courseSlug, lessonSlug, lessonTitle, initialTurns = [] }: { courseSlug: string; lessonSlug: string; lessonTitle: string; initialTurns?: TutorTurn[] }) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<TutorTurn[]>(initialTurns);
  const [conversationId, setConversationId] = useState<string | undefined>(initialTurns.at(-1)?.conversation_id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refreshHistory() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/tutor?${new URLSearchParams({ courseSlug, lessonSlug })}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTurns(data.turns); setConversationId(data.turns.at(-1)?.conversation_id);
    } catch { setError("No se pudo recuperar el historial."); }
    finally { setLoading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading) return;
    setError(""); setLoading(true);
    try {
      const response = await fetch("/api/tutor", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug, lessonSlug, question: cleanQuestion, conversationId, requestId: crypto.randomUUID() }),
      });
      const data = await response.json();
      if (!response.ok || !data.answer) throw new Error(data.error || "No pudimos obtener una respuesta.");
      setTurns(current => [...current, { id: data.id, conversation_id: data.conversationId, question: cleanQuestion, answer: data.answer,
        status: "succeeded", feedback: null, feedback_comment: null, created_at: new Date().toISOString(), truncated: data.truncated }]);
      setConversationId(data.conversationId); setQuestion("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "No pudimos obtener una respuesta."); }
    finally { setLoading(false); }
  }

  return <aside className="tutor-panel">
    <div className="tutor-heading"><span className="tutor-icon"><Sparkles size={21} /></span><div><strong>Tutor IA</strong><small>Contexto: {lessonTitle}</small></div></div>
    <div className="tutor-tools"><button type="button" disabled={loading} onClick={() => { setTurns([]); setConversationId(undefined); setError(""); }}>Nueva conversación</button><button type="button" disabled={loading} onClick={() => void refreshHistory()}>Recargar historial</button></div>
    <div className="tutor-conversation" aria-live="polite">
      {turns.length === 0 && <div className="tutor-intro"><MessageCircle size={20} /><p>Pregunta sobre esta lección. Tu conversación se guarda para continuar después.</p></div>}
      {turns.map(turn => <div key={turn.id}>
        <div className="message message-user"><span>TÚ</span><div className="tutor-message-text">{turn.question}</div></div>
        {turn.answer && <div className="message message-ai"><span>TUTOR IA</span><div className="tutor-answer"><Markdown skipHtml allowedElements={["p", "strong", "em", "code", "pre", "ul", "ol", "li", "blockquote", "h1", "h2", "h3", "h4", "br"]} unwrapDisallowed>{turn.answer}</Markdown></div>{turn.truncated && <small>La respuesta llegó al límite de extensión. Puedes pedir una explicación más breve.</small>}<ResponseFeedback turn={turn} /></div>}
        {turn.status === "failed" && <p className="tutor-wait">Esta consulta no obtuvo una respuesta.</p>}
        {turn.status === "pending" && <p className="tutor-wait">Esta consulta aún no tiene un resultado confirmado.</p>}
      </div>)}
      {loading && <p className="tutor-wait">Procesando…</p>}
    </div>
    <form className="tutor-bottom" onSubmit={submit}>
      <label htmlFor="tutor-question">Pregunta al Tutor IA</label>
      <div className="tutor-input-row"><input id="tutor-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} placeholder="Escribe tu pregunta…" disabled={loading} /><button type="submit" disabled={loading || !question.trim()}>Enviar</button></div>
      {error && <p role="alert">{error}</p>}
    </form>
  </aside>;
}
