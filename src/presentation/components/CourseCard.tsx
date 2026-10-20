import Link from "next/link";
import type { Course } from "../../domain/course";
import { ProgressBar } from "./ProgressBar";

interface CourseCardProps {
  course: Course;
  compact?: boolean;
}

export function CourseCard({ course, compact = false }: CourseCardProps) {
  return (
    <article className={`course-card ${compact ? "course-card-compact" : ""}`}>
      <div className="course-cover" aria-hidden="true"><span>{course.symbol}</span></div>
      <div className="course-card-body">
        <span className="category-tag">{course.categoryLabel}</span>
        <h3>{course.title}</h3>
        {!compact && <p>{course.description}</p>}
        <div className="course-meta"><span>{course.level}</span><span>·</span><span>{course.durationHours} h</span></div>
        {course.progress !== null && <ProgressBar value={course.progress} />}
        <Link className="text-link course-link" href={`/cursos/${course.slug}`}>Ver contenido <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}
