import Link from "next/link";
import type { ManagedAssessment, ManagedQuestion } from "../../domain/assessment";
import { LearningSubmitButton } from "../components/LearningSubmitButton";

type Action = (form: FormData) => Promise<void>;
export interface AssessmentAdminActions { save: Action; saveQuestion: Action; deleteQuestion: Action; publish: Action; delete: Action }

function QuestionForm({ assessmentId, question, position, action }: { assessmentId: string; question?: ManagedQuestion; position: number; action: Action }) {
  return <form action={action} className="admin-form">
    <input type="hidden" name="assessmentId" value={assessmentId} />{question && <input type="hidden" name="questionId" value={question.id} />}
    <label>Enunciado<textarea name="prompt" defaultValue={question?.prompt} minLength={3} maxLength={2000} rows={3} required /></label>
    <div className="admin-form-grid">{[0,1,2,3].map((index) => <label key={index}>Alternativa {String.fromCharCode(65 + index)}<input name={`option${index}`} defaultValue={question?.options[index]} maxLength={500} required /></label>)}</div>
    <div className="admin-form-grid"><label>Alternativa correcta<select name="correctOption" defaultValue={question?.correctOption ?? 0}>{[0,1,2,3].map((index) => <option key={index} value={index}>{String.fromCharCode(65 + index)}</option>)}</select></label>
      <label>Orden<input name="position" type="number" min={1} max={10000} defaultValue={position} required /></label></div>
    <LearningSubmitButton>{question ? "Guardar pregunta" : "Añadir pregunta"}</LearningSubmitButton>
  </form>;
}

export function AdminAssessmentDetailView({ assessment, actions, status }: { assessment: ManagedAssessment; actions: AssessmentAdminActions; status?: string }) {
  const editable = !assessment.isPublished && !assessment.hasAttempts;
  return <div className="admin-container"><Link href="/admin/evaluaciones" className="text-link">← Todas las evaluaciones</Link>
    <header className="admin-heading admin-detail-heading"><p className="eyebrow">GESTIÓN DE EVALUACIONES</p><h1>{assessment.title}<span className="title-period">.</span></h1><p>{assessment.courseSlug} · {assessment.isPublished ? "Publicada" : "Borrador"} · {assessment.questions.length}/50 preguntas</p></header>
    {status === "error" && <p className="admin-feedback admin-feedback-error" role="status">No se pudo guardar. Revisa los datos. Solo se editan borradores sin intentos; para publicar necesitas preguntas completas y un curso publicado.</p>}
    {status === "guardado" && <p className="admin-feedback" role="status">Cambios guardados.</p>}
    {assessment.hasAttempts && <p className="admin-feedback">Esta evaluación tiene intentos registrados. Sus preguntas y criterio de aprobación se conservan para proteger el historial. Puedes despublicarla y crear otra evaluación.</p>}
    <section className="admin-panel"><h2>Publicación</h2><p className="admin-muted">Publica para permitir nuevos intentos. Despublicar conserva los resultados existentes.</p>
      <form action={actions.publish}><input type="hidden" name="assessmentId" value={assessment.id} /><input type="hidden" name="published" value={String(!assessment.isPublished)} /><LearningSubmitButton>{assessment.isPublished ? "Despublicar evaluación" : "Publicar evaluación"}</LearningSubmitButton></form>
      {assessment.isPublished && <Link className="text-link" href={`/cursos/${assessment.courseSlug}/evaluaciones/${assessment.id}`}>Ver evaluación →</Link>}
    </section>
    <section className="admin-panel"><h2>Datos de la evaluación</h2>
      {editable ? <form action={actions.save} className="admin-form"><input type="hidden" name="assessmentId" value={assessment.id} /><input type="hidden" name="courseSlug" value={assessment.courseSlug} />
        <label>Título<input name="title" defaultValue={assessment.title} minLength={3} maxLength={120} required /></label><label>Descripción<textarea name="description" rows={3} maxLength={2000} defaultValue={assessment.description} /></label>
        <label>Nota mínima (sobre 20)<input type="number" name="passingScore" defaultValue={assessment.passingScore} min={1} max={20} required /></label><LearningSubmitButton>Guardar evaluación</LearningSubmitButton>
      </form> : <p className="admin-muted">{assessment.description || "Sin descripción"} · Mínimo aprobatorio: {assessment.passingScore}/20. {assessment.hasAttempts ? "Edición bloqueada por historial." : "Despublica antes de editar."}</p>}
    </section>
    <section className="admin-panel"><h2>Preguntas</h2>{assessment.questions.map((question,index) => <article className="admin-module" key={question.id}><h3>{index+1}. {question.prompt}</h3>
      {editable ? <><QuestionForm assessmentId={assessment.id} question={question} position={question.position} action={actions.saveQuestion} />
        <form action={actions.deleteQuestion} className="admin-danger-form"><input type="hidden" name="assessmentId" value={assessment.id} /><input type="hidden" name="questionId" value={question.id} /><label className="admin-check"><input type="checkbox" name="confirm" required />Confirmo la eliminación de esta pregunta</label><button className="button button-outline" type="submit">Eliminar pregunta</button></form></>
        : <ol type="A">{question.options.map((option,index) => <li key={index}>{option}{index===question.correctOption ? " · Correcta" : ""}</li>)}</ol>}
    </article>)}
      {editable && assessment.questions.length<50 && <div className="admin-add-module"><h3>Añadir pregunta</h3><QuestionForm assessmentId={assessment.id} position={Math.max(0,...assessment.questions.map((question)=>question.position))+1} action={actions.saveQuestion} /></div>}
      {!assessment.questions.length && <p className="admin-muted">Añade la primera pregunta antes de publicar.</p>}
    </section>
    {editable && <section className="admin-panel"><h2>Eliminar borrador</h2><form action={actions.delete} className="admin-danger-form"><input type="hidden" name="assessmentId" value={assessment.id} /><label className="admin-check"><input type="checkbox" name="confirm" required />Confirmo que quiero eliminar el borrador y sus preguntas</label><button className="button button-outline" type="submit">Eliminar evaluación</button></form></section>}
  </div>;
}
