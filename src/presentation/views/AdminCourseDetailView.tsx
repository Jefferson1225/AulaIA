import Link from "next/link";
import type { CatalogCategory } from "../../domain/course";
import type { ManagedCourse } from "../../domain/content";

type FormAction = (form: FormData) => Promise<void>;

interface DetailActions {
  updateCourse: FormAction;
  deleteCourse: FormAction;
  createModule: FormAction;
  updateModule: FormAction;
  deleteModule: FormAction;
  createLesson: FormAction;
  updateLesson: FormAction;
  deleteLesson: FormAction;
}

export function AdminCourseDetailView({
  course, categories, actions, status,
}: {
  course: ManagedCourse;
  categories: CatalogCategory[];
  actions: DetailActions;
  status?: string;
}) {
  return (
    <div className="admin-container">
      <Link className="text-link" href="/admin/cursos">← Todos los cursos</Link>
      <header className="admin-heading admin-detail-heading">
        <p className="eyebrow">GESTIÓN DE CONTENIDO</p>
        <h1>{course.title}<span className="title-period">.</span></h1>
        <p>{course.slug} · {course.isPublished ? "Publicado" : "Borrador"}</p>
        {course.isPublished && <Link className="text-link" href={`/cursos/${course.slug}`}>Ver como estudiante →</Link>}
      </header>

      {status && <p className={`admin-feedback ${status === "error" ? "admin-feedback-error" : ""}`} role="status">
        {status === "error" ? "No se pudo guardar. Revisa los datos y que los identificadores no estén repetidos." : "Cambios guardados."}
      </p>}

      <section className="admin-panel">
        <div className="admin-section-heading"><h2>Datos del curso</h2><span>El identificador no cambia</span></div>
        <form action={actions.updateCourse} className="admin-form">
          <input type="hidden" name="slug" value={course.slug} />
          <div className="admin-form-grid">
            <label>Título<input name="title" defaultValue={course.title} required minLength={3} maxLength={120} /></label>
            <label>Categoría<select name="categorySlug" defaultValue={course.categorySlug}>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
            <label>Nivel<select name="level" defaultValue={course.level}><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select></label>
            <label>Duración estimada (horas)<input name="durationHours" type="number" min={1} defaultValue={course.durationHours} required /></label>
            <label>Símbolo<input name="symbol" defaultValue={course.symbol} maxLength={12} required /></label>
          </div>
          <label>Descripción<textarea name="description" rows={3} defaultValue={course.description} maxLength={2000} /></label>
          <label className="admin-check"><input type="checkbox" name="isPublished" defaultChecked={course.isPublished} /> Publicar en el catálogo</label>
          <button className="button button-primary" type="submit">Guardar curso</button>
        </form>
        {!course.isPublished && <form action={actions.deleteCourse} className="admin-danger-form">
          <input type="hidden" name="slug" value={course.slug} />
          <label className="admin-check"><input type="checkbox" name="confirm" required /> Confirmo que quiero eliminar este borrador y todo su contenido</label>
          <button className="button button-outline" type="submit">Eliminar curso borrador</button>
        </form>}
      </section>

      <section className="admin-panel">
        <div className="admin-section-heading"><h2>Módulos y lecciones</h2><span>{course.modules.length} módulos</span></div>
        {course.modules.map((module) => <article className="admin-module" key={module.slug}>
          <div className="admin-module-heading"><h3>{module.position}. {module.title}</h3><span>{module.lessons.length} lecciones</span></div>
          <form action={actions.updateModule} className="admin-form admin-inline-form">
            <input type="hidden" name="courseSlug" value={course.slug} />
            <input type="hidden" name="slug" value={module.slug} />
            <label>Título del módulo<input name="title" defaultValue={module.title} required minLength={3} maxLength={120} /></label>
            <label>Orden<input name="position" type="number" min={1} defaultValue={module.position} required /></label>
            <button className="button button-outline" type="submit">Guardar módulo</button>
          </form>

          {module.lessons.length ? <div className="admin-lessons">{module.lessons.map((lesson) => <details key={lesson.slug} className="admin-lesson">
            <summary><strong>{lesson.position}. {lesson.title}</strong><span>{lesson.durationMinutes} min · editar</span></summary>
            <form action={actions.updateLesson} className="admin-form">
              <input type="hidden" name="courseSlug" value={course.slug} />
              <input type="hidden" name="moduleSlug" value={module.slug} />
              <input type="hidden" name="slug" value={lesson.slug} />
              <div className="admin-form-grid">
                <label>Título<input name="title" defaultValue={lesson.title} minLength={3} maxLength={120} required /></label>
                <label>Orden<input name="position" type="number" min={1} defaultValue={lesson.position} required /></label>
                <label>Duración (minutos)<input name="durationMinutes" type="number" min={1} defaultValue={lesson.durationMinutes} required /></label>
              </div>
              <label>Introducción<textarea name="intro" rows={2} defaultValue={lesson.intro} required /></label>
              <label>Contenido<textarea name="content" rows={7} defaultValue={lesson.content} required /></label>
              <label>Ejemplo de código (opcional)<textarea name="exampleCode" rows={4} defaultValue={lesson.exampleCode} /></label>
              <label>Consejo final (opcional)<textarea name="tip" rows={2} defaultValue={lesson.tip} /></label>
              <button className="button button-primary" type="submit">Guardar lección</button>
            </form>
            <form action={actions.deleteLesson} className="admin-danger-form">
              <input type="hidden" name="courseSlug" value={course.slug} />
              <input type="hidden" name="slug" value={lesson.slug} />
              <label className="admin-check"><input type="checkbox" name="confirm" required /> Confirmo la eliminación de esta lección</label>
              <button className="button button-outline" type="submit">Eliminar lección</button>
            </form>
          </details>)}</div> : <p className="admin-muted">Este módulo todavía no tiene lecciones.</p>}

          <details className="admin-add-details"><summary>+ Añadir lección</summary>
            <form action={actions.createLesson} className="admin-form">
              <input type="hidden" name="courseSlug" value={course.slug} />
              <input type="hidden" name="moduleSlug" value={module.slug} />
              <div className="admin-form-grid">
                <label>Identificador (slug)<input name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} placeholder="primeros-pasos" required /></label>
                <label>Título<input name="title" minLength={3} maxLength={120} required /></label>
                <label>Orden<input name="position" type="number" min={1} defaultValue={module.lessons.length + 1} required /></label>
                <label>Duración (minutos)<input name="durationMinutes" type="number" min={1} defaultValue={15} required /></label>
              </div>
              <label>Introducción<textarea name="intro" rows={2} required /></label>
              <label>Contenido<textarea name="content" rows={7} required /></label>
              <label>Ejemplo de código (opcional)<textarea name="exampleCode" rows={4} /></label>
              <label>Consejo final (opcional)<textarea name="tip" rows={2} /></label>
              <button className="button button-primary" type="submit">Crear lección</button>
            </form>
          </details>

          <form action={actions.deleteModule} className="admin-danger-form">
            <input type="hidden" name="courseSlug" value={course.slug} />
            <input type="hidden" name="slug" value={module.slug} />
            <label className="admin-check"><input type="checkbox" name="confirm" required /> Confirmo la eliminación del módulo y sus lecciones</label>
            <button className="button button-outline" type="submit">Eliminar módulo</button>
          </form>
        </article>)}

        <div className="admin-add-module">
          <h3>Añadir módulo</h3>
          <form action={actions.createModule} className="admin-form admin-inline-form">
            <input type="hidden" name="courseSlug" value={course.slug} />
            <label>Identificador (slug)<input name="slug" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} placeholder="fundamentos" required /></label>
            <label>Título<input name="title" minLength={3} maxLength={120} required /></label>
            <label>Orden<input name="position" type="number" min={1} defaultValue={course.modules.length + 1} required /></label>
            <button className="button button-primary" type="submit">Crear módulo</button>
          </form>
        </div>
      </section>
    </div>
  );
}
