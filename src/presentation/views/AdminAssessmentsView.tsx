import Link from "next/link";
import type { Assessment } from "../../domain/assessment";
import { LearningSubmitButton } from "../components/LearningSubmitButton";

export function AdminAssessmentsView({ assessments, courses, saveAction, status }: {
  assessments: Assessment[]; courses: { slug: string; title: string }[]; saveAction: (form: FormData) => Promise<void>; status?: string;
}) {
  const titles = new Map(courses.map((course) => [course.slug, course.title]));
  return <div className="admin-container"><header className="admin-heading"><p className="eyebrow">EVALUACIONES Y RESULTADOS</p><h1>Evaluaciones<span className="title-period">.</span></h1><p>Crea preguntas, define la nota mínima y publica cada evaluación cuando esté lista.</p></header>
    {status === "error" && <p className="admin-feedback admin-feedback-error" role="status">No se pudo guardar. Revisa los datos y los permisos.</p>}
    <section className="admin-panel"><h2>Evaluaciones registradas</h2>
      {assessments.length ? <div className="admin-course-list">{assessments.map((assessment) => <Link className="admin-course-row" key={assessment.id} href={`/admin/evaluaciones/${assessment.id}`}>
        <span><strong>{assessment.title}</strong><small>{titles.get(assessment.courseSlug) ?? assessment.courseSlug} · mínimo {assessment.passingScore}/20</small></span>
        <span className={`admin-badge ${assessment.isPublished ? "admin-badge-live" : ""}`}>{assessment.isPublished ? "Publicada" : "Borrador"}</span><span>→</span>
      </Link>)}</div> : <p className="admin-muted">Todavía no hay evaluaciones.</p>}
    </section>
    <section className="admin-panel"><h2>Crear evaluación</h2><form action={saveAction} className="admin-form">
      <div className="admin-form-grid"><label>Curso<select name="courseSlug" required defaultValue=""><option value="" disabled>Selecciona un curso</option>{courses.map((course) => <option key={course.slug} value={course.slug}>{course.title}</option>)}</select></label>
        <label>Título<input name="title" minLength={3} maxLength={120} required /></label><label>Nota mínima (sobre 20)<input type="number" name="passingScore" min={1} max={20} defaultValue={12} required /></label></div>
      <label>Descripción<textarea name="description" maxLength={2000} rows={3} /></label><LearningSubmitButton>Crear borrador</LearningSubmitButton>
    </form></section>
  </div>;
}
