import Link from "next/link";
import { BookOpen, Clock3 } from "lucide-react";
import type { PublishedCourse } from "../../domain/content";
import type { CourseProgress } from "../../domain/learning";
import { ProgressBar } from "../components/ProgressBar";
import { LearningSubmitButton } from "../components/LearningSubmitButton";
import { LearningFeedback } from "../components/LearningFeedback";

export function CourseOverviewView({ course, progress, enrollAction, status, demo = false }: {
  course: PublishedCourse;
  progress?: CourseProgress;
  enrollAction?: (form: FormData) => Promise<void>;
  status?: string;
  demo?: boolean;
}) {
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

      <LearningFeedback status={status} />
      {demo && <p className="learning-empty">Vista de demostración: las matrículas y el avance no se guardan.</p>}
      {progress && <section className="learning-enrollment" aria-label="Mi matrícula y progreso">
        {progress.enrolled ? <>
          <p className="eyebrow">YA FORMAS PARTE DE ESTE CURSO</p>
          <ProgressBar value={progress.percent} label="Progreso del curso" />
          <p>{progress.completedLessons} de {progress.totalLessons} lecciones completadas</p>
          {progress.nextLesson ? <Link className="button button-primary" href={`/cursos/${course.slug}/lecciones/${progress.nextLesson.slug}`}>Continuar curso</Link>
            : <p>{progress.totalLessons ? "Completaste todas las lecciones disponibles." : "Tu matrícula está lista. El curso todavía no tiene lecciones."}</p>}
        </> : <>
          <h2>Empieza tu aprendizaje</h2>
          <p>Matricúlate para registrar las lecciones que completes y retomar tu avance desde el inicio.</p>
          {enrollAction && <form action={enrollAction}>
            <input type="hidden" name="courseSlug" value={course.slug} />
            <LearningSubmitButton>Matricularme en este curso</LearningSubmitButton>
          </form>}
        </>}
      </section>}

      <section className="content-overview-body" aria-label="Contenido del curso">
        <h2>Contenido del curso</h2>
        {course.modules.length ? course.modules.map((module) => <article className="content-module" key={module.slug}>
          <div className="content-module-heading"><span>MÓDULO {module.position}</span><h3>{module.title}</h3></div>
          {module.lessons.length ? <ol>{module.lessons.map((lesson) => <li key={lesson.slug}>
            <Link href={`/cursos/${course.slug}/lecciones/${lesson.slug}`}>
              <span>{lesson.position}. {lesson.title}</span>{progress?.completedLessonSlugs.includes(lesson.slug) && <small className="learning-completed">Completada</small>}<small>{lesson.durationMinutes} min</small><span aria-hidden="true">→</span>
            </Link>
          </li>)}</ol> : <p>Aún no hay lecciones en este módulo.</p>}
        </article>) : <div className="content-empty"><BookOpen size={27} /><p>Este curso todavía no tiene lecciones. Vuelve pronto para empezar.</p></div>}
      </section>
    </main>
  );
}
