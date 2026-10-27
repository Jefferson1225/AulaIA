import Link from "next/link";
import type { AssessmentAttempt } from "../../domain/assessment";

export function AssessmentHistoryView({ attempts }: { attempts: AssessmentAttempt[] }) {
  return <div className="view-container">
    <header className="page-heading"><div><p className="eyebrow">MI APRENDIZAJE</p><h1>Mis resultados<span className="title-period">.</span></h1><p>Consulta tus intentos y revisa los temas que puedes reforzar.</p></div></header>
    {attempts.length ? <section className="assessment-history" aria-label="Historial de evaluaciones"><ol>{attempts.map((attempt)=><li key={attempt.id}>
      <Link href={`/cursos/${attempt.courseSlug}/evaluaciones/${attempt.assessmentId}/resultados/${attempt.id}`}>
        <span><strong>{attempt.assessmentTitle}</strong><small className="assessment-history-date">{new Date(attempt.submittedAt).toLocaleString("es-PE",{timeZone:"America/Lima"})}</small></span>
        <strong>{attempt.score.toFixed(2)} / 20</strong><span>{attempt.passed ? "Aprobado" : "Por reforzar"}</span><span>Ver resultado →</span>
      </Link>
    </li>)}</ol></section> : <p className="learning-empty">Todavía no tienes resultados. Abre un curso en el que estés matriculado y resuelve una evaluación.</p>}
    <Link className="text-link" href="/inicio#mis-cursos">Ir a mis cursos →</Link>
  </div>;
}
