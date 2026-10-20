import Link from "next/link";
import type { CatalogCategory } from "../../domain/course";
import type { ManagedCourse } from "../../domain/content";

export function AdminCoursesView({
  categories, courses, createAction, status,
}: {
  categories: CatalogCategory[];
  courses: ManagedCourse[];
  createAction: (form: FormData) => Promise<void>;
  status?: string;
}) {
  return (
    <div className="admin-container">
      <header className="admin-heading">
        <p className="eyebrow">CONTENIDO ACADÉMICO</p>
        <h1>Gestión de cursos<span className="title-period">.</span></h1>
        <p>Crea cursos como borrador, organiza sus módulos y lecciones y publícalos cuando estén listos.</p>
      </header>

      {status && <p className={`admin-feedback ${status === "error" ? "admin-feedback-error" : ""}`} role="status">
        {status === "error" ? "No se pudo guardar. Revisa los datos y que el identificador no esté repetido." : "Cambios guardados."}
      </p>}

      <section className="admin-panel">
        <div className="admin-section-heading"><h2>Cursos registrados</h2><span>{courses.length} en total</span></div>
        {courses.length ? <div className="admin-course-list">{courses.map((course) => (
          <Link className="admin-course-row" key={course.slug} href={`/admin/cursos/${course.slug}`}>
            <span className="admin-course-symbol">{course.symbol}</span>
            <span><strong>{course.title}</strong><small>{course.slug} · {course.level} · {course.durationHours} h</small></span>
            <span className={`admin-badge ${course.isPublished ? "admin-badge-live" : ""}`}>{course.isPublished ? "Publicado" : "Borrador"}</span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}</div> : <p className="admin-muted">Aún no hay cursos.</p>}
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading"><h2>Crear curso</h2><span>Se guardará como borrador</span></div>
        <form action={createAction} className="admin-form">
          <div className="admin-form-grid">
            <label>Identificador (slug)<input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} placeholder="robotica-basica" /></label>
            <label>Título<input name="title" required minLength={3} maxLength={120} placeholder="Robótica básica" /></label>
            <label>Categoría<select name="categorySlug" required defaultValue=""><option value="" disabled>Selecciona una categoría</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
            <label>Nivel<select name="level" defaultValue="principiante"><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select></label>
            <label>Duración estimada (horas)<input name="durationHours" type="number" min={1} defaultValue={1} required /></label>
            <label>Símbolo<input name="symbol" maxLength={12} defaultValue="◈" required /></label>
          </div>
          <label>Descripción<textarea name="description" rows={3} maxLength={2000} placeholder="Qué aprenderá el estudiante" /></label>
          <button className="button button-primary" type="submit">Crear curso</button>
        </form>
      </section>
    </div>
  );
}
