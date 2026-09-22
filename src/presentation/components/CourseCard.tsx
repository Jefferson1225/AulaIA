import Link from "next/link";
import type { Course } from "../../domain/course";
import { ProgressBar } from "./ProgressBar";

interface CourseCardProps {
  course: Course;
  compact?: boolean;
}

export function CourseCard({ course, compact = false }: CourseCardProps) {
  const lessonUrl = course.slug === "fundamentos-python"
    ? "/cursos/fundamentos-python/lecciones/variables-y-tipos"
    : null;

  return (
    <article className={`course-card ${compact ? "course-card-compact" : ""}`}>
      <div className="course-cover" aria-hidden="true"><span>{course.symbol}</span></div>
      <div className="course-card-body">
        <span className="category-tag">{course.categoryLabel}</span>
        <h3>{course.title}</h3>
        {!compact && <p>{course.description}</p>}
        <div className="course-meta"><span>{course.level}</span><span>·</span><span>{course.durationHours} h</span></div>
        {course.progress !== null && <ProgressBar value={course.progress} />}
        {lessonUrl ? <Link className="text-link course-link" href={lessonUrl}>Ver lección de muestra <span aria-hidden="true">→</span></Link> : <span className="course-unavailable">Contenido próximamente</span>}
      </div>
    </article>
  );
}
