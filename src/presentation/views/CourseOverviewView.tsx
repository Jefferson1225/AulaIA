import Link from "next/link";
import { BookOpen, Clock3 } from "lucide-react";
import type { PublishedCourse } from "../../domain/content";

export function CourseOverviewView({ course }: { course: PublishedCourse }) {
  const lessonCount = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  return (
    <main className="content-overview">
      <Link className="text-link" href="/catalogo">← Volver al catálogo</Link>
      <header className="content-overview-heading">
        <p className="eyebrow">CURSO DISPONIBLE</p>
        <h1>{course.title}<span className="title-period">.</span></h1>
        <p>{course.description}</p>
        <div className="content-overview-meta"><span><BookOpen size={17} /> {course.modules.length} módulos</span><span><Clock3 size={17} /> {lessonCount} lecciones</span><span>{course.level}</span></div>
      </header>

      <section className="content-overview-body" aria-label="Contenido del curso">
        <h2>Contenido del curso</h2>
        {course.modules.length ? course.modules.map((module) => <article className="content-module" key={module.slug}>
          <div className="content-module-heading"><span>MÓDULO {module.position}</span><h3>{module.title}</h3></div>
          {module.lessons.length ? <ol>{module.lessons.map((lesson) => <li key={lesson.slug}>
            <Link href={`/cursos/${course.slug}/lecciones/${lesson.slug}`}>
              <span>{lesson.position}. {lesson.title}</span><small>{lesson.durationMinutes} min</small><span aria-hidden="true">→</span>
            </Link>
          </li>)}</ol> : <p>Aún no hay lecciones en este módulo.</p>}
        </article>) : <div className="content-empty"><BookOpen size={27} /><p>Este curso todavía no tiene lecciones. Vuelve pronto para empezar.</p></div>}
      </section>
    </main>
  );
}
