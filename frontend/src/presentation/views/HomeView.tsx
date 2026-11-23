import Link from "next/link";
import { ArrowRight, BookOpen, BookOpenCheck, ChevronRight, CircleCheck, ClipboardList, Compass, LockKeyhole, Play } from "lucide-react";
import { canTakeCourseAssessments } from "@aulaia/backend/application/learning-progress";
import type { Assessment } from "@aulaia/backend/domain/assessment";
import type { Course } from "@aulaia/backend/domain/course";
import type { CourseProgress } from "@aulaia/backend/domain/learning";
import { ProgressBar } from "../components/ProgressBar";

interface HomeViewProps {
  continueCourse: Course | null;
  enrolledCourses: Course[];
  recommendedCourses: Course[];
  displayName?: string;
  continueLesson?: { title: string; href: string } | null;
  courseProgress?: Record<string, CourseProgress>;
  assessments?: Assessment[];
}

function lessonCount(progress: CourseProgress) {
  return `${progress.completedLessons} de ${progress.totalLessons} lecciones`;
}

export function HomeView({
  continueCourse, enrolledCourses, recommendedCourses, displayName = "Valentina",
  continueLesson, courseProgress = {}, assessments = [],
}: HomeViewProps) {
  const firstName = displayName.trim().split(/\s+/)[0];
  const currentProgress = continueCourse && courseProgress[continueCourse.slug];
  const currentAssessment = assessments.find((item) => item.courseSlug === continueCourse?.slug)
    ?? assessments.find((item) => canTakeCourseAssessments(courseProgress[item.courseSlug]))
    ?? assessments[0];
  const canTakeAssessment = currentAssessment && canTakeCourseAssessments(courseProgress[currentAssessment.courseSlug]);
  const completeCount = enrolledCourses.filter((course) => course.progress === 100).length;
  const lessonTotal = enrolledCourses.reduce((total, course) => total + (courseProgress[course.slug]?.completedLessons ?? 0), 0);

  return (
    <div className="view-container study-home">
      <header className="page-heading study-heading">
        <div>
          <h1>Mi espacio de estudio</h1>
          <p>Hola, {firstName}. {enrolledCourses.length ? "Retoma tus clases y revisa lo que sigue." : "Vamos a encontrar tu primer curso."}</p>
        </div>
      </header>
      <div className="study-grid">
        <section className="study-panel" aria-labelledby="activities-title">
          <h2 id="activities-title">{enrolledCourses.length ? "Próximas actividades" : "Empieza aquí"}</h2>
          {!enrolledCourses.length ? (
            <div className="study-first">
              <span className="study-icon"><Compass size={28} aria-hidden="true" /></span>
              <div>
                <h3>Encuentra tu primer curso</h3>
                <p>Todavía no te has matriculado en ningún curso. Elige un tema que te interese y abre el curso para matricularte.</p>
                <Link href="/catalogo" className="button button-primary">Explorar catálogo <ArrowRight size={17} /></Link>
              </div>
            </div>
          ) : (
            <>
              {continueCourse && <div className="study-row study-continue">
                <span className="study-icon study-symbol" aria-hidden="true">{continueCourse.symbol}</span>
                <div className="study-row-copy">
                  <p>{continueCourse.title}</p>
                  <h3>{continueLesson?.title ?? "Retoma tu curso"}</h3>
                  <ProgressBar value={continueCourse.progress ?? 0} label={currentProgress ? `${lessonCount(currentProgress)} completadas` : "Avance del curso"} />
                </div>
                <Link href={continueLesson?.href ?? `/cursos/${continueCourse.slug}`} className="button button-primary">{continueLesson ? "Continuar lección" : "Ver curso"} <ArrowRight size={17} /></Link>
              </div>}
              {currentAssessment && <Link className="study-row study-exam" href={`/cursos/${currentAssessment.courseSlug}/evaluaciones/${currentAssessment.id}`}>
                <span className="study-icon study-icon-muted"><ClipboardList size={25} aria-hidden="true" /></span>
                <span className="study-row-copy">
                  <strong>{currentAssessment.title}</strong>
                  <small>{canTakeAssessment ? "Ya puedes rendir la evaluación." : "Completa todas las lecciones para desbloquearla."}</small>
                </span>
                <span className={`study-status${canTakeAssessment ? " study-status-ready" : ""}`}>{canTakeAssessment ? <CircleCheck size={15} /> : <LockKeyhole size={15} />}{canTakeAssessment ? "Disponible" : "Bloqueada"}</span>
              </Link>}
              {!continueCourse && !currentAssessment && <p className="learning-empty">No tienes lecciones pendientes. Puedes explorar otro curso o revisar tus resultados.</p>}
              <dl className="study-metrics" id="progreso">
                <div><span className="study-icon"><BookOpen size={20} /></span><div><dt>Cursos inscritos</dt><dd>{enrolledCourses.length}</dd></div></div>
                <div><span className="study-icon"><Play size={20} /></span><div><dt>Lecciones completadas</dt><dd>{lessonTotal}</dd></div></div>
                <div><span className="study-icon"><BookOpenCheck size={20} /></span><div><dt>Cursos completados</dt><dd>{completeCount}</dd></div></div>
              </dl>
            </>
          )}
        </section>
        <section className="study-panel study-course-panel" id="mis-cursos" aria-labelledby="courses-title">
          <h2 id="courses-title">{enrolledCourses.length ? "Mis cursos" : "Cursos para empezar"}</h2>
          <div className="study-course-list">
            {(enrolledCourses.length ? enrolledCourses : recommendedCourses).map((course) => {
              const progress = courseProgress[course.slug];
              return <Link className="study-course-row" href={`/cursos/${course.slug}`} key={course.slug}>
                <span className="study-icon study-symbol" aria-hidden="true">{course.symbol}</span>
                <span><strong>{course.title}</strong><small>{progress ? lessonCount(progress) : course.progress !== null ? `${course.progress}% completado` : course.categoryLabel}</small></span>
                <ChevronRight size={19} aria-hidden="true" />
              </Link>;
            })}
          </div>
          <Link href="/catalogo" className="text-link study-catalog-link">{enrolledCourses.length ? "Explorar catálogo" : "Ver todos los cursos"} <ArrowRight size={15} /></Link>
        </section>
      </div>
    </div>
  );
}
