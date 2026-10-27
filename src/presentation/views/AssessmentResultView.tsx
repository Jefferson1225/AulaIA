import Link from "next/link";
import type { AssessmentAttempt } from "../../domain/assessment";

export function AssessmentResultView({ attempt, retryAvailable }: { attempt: AssessmentAttempt; retryAvailable: boolean }) {
  return <main className="assessment-container">
    <Link href={`/cursos/${attempt.courseSlug}`} className="text-link">← Volver al curso</Link>
    <header className="assessment-heading"><p className="eyebrow">RESULTADO REGISTRADO</p><h1>{attempt.assessmentTitle}<span className="title-period">.</span></h1></header>
    <section className="assessment-result" aria-label="Resultado de mi intento">
      <span className={`assessment-badge ${attempt.passed ? "assessment-pass" : ""}`}>{attempt.passed ? "Aprobado" : "Por reforzar"}</span>
      <strong className="assessment-score">{attempt.score.toFixed(2)} / 20</strong>
      <p>{attempt.correctCount} de {attempt.totalQuestions} respuestas correctas</p><p>Nota mínima: {attempt.passingScore} / 20</p>
      <small>{new Date(attempt.submittedAt).toLocaleString("es-PE", { timeZone: "America/Lima" })}</small>
    </section>
    <section className="assessment-review"><h2>Revisión de tus respuestas</h2>{attempt.answers.map((answer, index) => <article key={answer.questionId} className="assessment-panel">
      <h3>{index + 1}. {answer.prompt}</h3><p>Tu respuesta: <strong>{answer.selectedOption}</strong></p>
      <span className={`assessment-badge ${answer.correct ? "assessment-pass" : ""}`}>{answer.correct ? "Respuesta correcta" : "Revisa este tema"}</span>
    </article>)}</section>
    {retryAvailable && <Link className="button button-primary" href={`/cursos/${attempt.courseSlug}/evaluaciones/${attempt.assessmentId}`}>Volver a la evaluación</Link>}
  </main>;
}
