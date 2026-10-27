import Link from "next/link";
import type { Assessment, AssessmentAttempt, AssessmentQuestion } from "../../domain/assessment";
import { LearningSubmitButton } from "../components/LearningSubmitButton";

export function AssessmentView({ assessment, questions, enrolled, attempts, requestId, submitAction, status }: {
  assessment: Assessment; questions: AssessmentQuestion[]; enrolled: boolean; attempts: AssessmentAttempt[];
  requestId: string; submitAction: (form: FormData) => Promise<void>; status?: string;
}) {
  const base = `/cursos/${assessment.courseSlug}/evaluaciones/${assessment.id}`;
  return <main className="assessment-container">
    <Link href={`/cursos/${assessment.courseSlug}`} className="text-link">← Volver al curso</Link>
    <header className="assessment-heading"><p className="eyebrow">EVALUACIÓN DEL CURSO</p><h1>{assessment.title}<span className="title-period">.</span></h1>
      <p>{assessment.description}</p><span className="assessment-badge">Nota mínima: {assessment.passingScore} / 20</span>
    </header>
    {status === "error" && <p className="learning-feedback learning-feedback-error" role="status">No se pudo registrar el intento. La evaluación pudo cambiar: recarga la página, comprueba tu matrícula y responde todas las preguntas.</p>}
    {!enrolled ? <section className="assessment-panel"><h2>Registra tu matrícula para participar</h2><p>Las evaluaciones están disponibles para estudiantes inscritos en este curso.</p><Link className="button button-primary" href={`/cursos/${assessment.courseSlug}`}>Matricularme en el curso</Link></section>
      : questions.length ? <form action={submitAction} className="assessment-form">
        <input type="hidden" name="courseSlug" value={assessment.courseSlug} />
        <input type="hidden" name="assessmentId" value={assessment.id} />
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="version" value={assessment.version} />
        <p className="assessment-instructions">Selecciona una alternativa por pregunta. Todas tienen el mismo valor. Al enviar, se registrará un nuevo intento y podrás consultar tu resultado.</p>
        {questions.map((question, index) => <fieldset className="assessment-question" key={question.id}>
          <legend><span>Pregunta {index + 1}</span>{question.prompt}</legend>
          {question.options.map((option, optionIndex) => <label className="assessment-option" key={optionIndex}>
            <input type="radio" name={`answer-${question.id}`} value={optionIndex} required /><span>{String.fromCharCode(65 + optionIndex)}.</span><strong>{option}</strong>
          </label>)}
        </fieldset>)}
        <LearningSubmitButton>Enviar respuestas</LearningSubmitButton>
      </form> : <p className="learning-empty">Esta evaluación todavía no tiene preguntas disponibles.</p>}

    <section className="assessment-history"><h2>Mis intentos</h2>
      {attempts.length ? <ol>{attempts.map((attempt) => <li key={attempt.id}><Link href={`${base}/resultados/${attempt.id}`}>
        <span>{new Date(attempt.submittedAt).toLocaleString("es-PE", { timeZone: "America/Lima" })}</span>
        <strong>{attempt.score.toFixed(2)} / 20</strong><span>{attempt.passed ? "Aprobado" : "Por reforzar"}</span><span>Ver resultado →</span>
      </Link></li>)}</ol> : <p className="learning-empty">Todavía no tienes intentos registrados.</p>}
    </section>
  </main>;
}
