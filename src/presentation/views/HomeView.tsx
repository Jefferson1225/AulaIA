import Link from "next/link";
import { ArrowRight, BookOpenCheck, ClipboardList, Lightbulb, Play, Sparkles } from "lucide-react";
import type { Course, LearningActivity } from "../../domain/course";
import { CourseCard } from "../components/CourseCard";
import { ProgressBar } from "../components/ProgressBar";

interface HomeViewProps {
  continueCourse: Course | null;
  enrolledCourses: Course[];
  recommendedCourses: Course[];
  activities: LearningActivity[];
  displayName?: string;
  continueLesson?: { title: string; href: string } | null;
}

const activityIcons = { evaluation: ClipboardList, lesson: Play, practice: Lightbulb };

export function HomeView({ continueCourse, enrolledCourses, recommendedCourses, activities, displayName, continueLesson }: HomeViewProps) {
  return (
    <div className="view-container">
      <div className="page-heading">
        <div><p className="eyebrow">TU ESPACIO DE APRENDIZAJE</p><h1>{displayName ? `Hola, ${displayName}` : "Buenos días, Valentina"}<span className="title-period">.</span></h1><p>Continúa donde lo dejaste y descubre lo que sigue.</p></div>
        <Link href="/catalogo" className="button button-outline">Explorar catálogo <ArrowRight size={17} /></Link>
      </div>

      <section className="learning-summary" id="progreso" aria-label="Resumen de mi progreso">
        <div><strong>{enrolledCourses.length}</strong><span>Cursos inscritos</span></div>
        <div><strong>{enrolledCourses.filter((course) => (course.progress ?? 0) < 100).length}</strong><span>En curso</span></div>
        <div><strong>{enrolledCourses.filter((course) => course.progress === 100).length}</strong><span>Cursos completados</span></div>
      </section>

      {continueCourse && <section className="continue-panel" aria-label="Continuar aprendiendo">
        <div className="continue-decoration" aria-hidden="true">⟨/⟩</div>
        <div className="continue-content">
          <p className="continue-eyebrow"><Sparkles size={16} /> CONTINUAR APRENDIENDO</p>
          <h2>{continueCourse.title}</h2>
          <p>{continueLesson ? <>Retoma la lección <strong>{continueLesson.title}</strong>.</> : "Revisa el contenido y continúa aprendiendo a tu ritmo."}</p>
          <ProgressBar value={continueCourse.progress ?? 0} label="Progreso del curso" />
          <div className="continue-actions">
            <Link href={continueLesson?.href ?? `/cursos/${continueCourse.slug}`} className="button button-primary"><Play size={17} fill="currentColor" /> {continueLesson ? "Continuar lección" : "Ver curso"}</Link>
          </div>
        </div>
      </section>}

      <section className="section-block" id="mis-cursos">
        <div className="section-header"><div><p className="eyebrow">EN TU CAMINO</p><h2>Mis cursos</h2></div><Link href="/catalogo" className="text-link">Ver catálogo <ArrowRight size={16} /></Link></div>
        {enrolledCourses.length ? <div className="course-grid">{enrolledCourses.map((course) => <CourseCard key={course.slug} course={course} compact />)}</div>
          : <p className="learning-empty">Todavía no te has matriculado en ningún curso. Explora el catálogo para empezar.</p>}
      </section>

      <div className="home-bottom-grid">
        <section className="surface-card">
          <div className="section-header"><div><p className="eyebrow">A CONTINUACIÓN</p><h2>Próximas actividades</h2></div><BookOpenCheck size={21} className="section-icon" /></div>
          {!activities.length && <p className="learning-empty">No tienes lecciones pendientes en los cursos disponibles.</p>}
          <div className="activity-list">{activities.map(({ title, detail, kind, href }) => {
            const Icon = activityIcons[kind];
            const body = <><span className="activity-icon"><Icon size={19} /></span><span><strong>{title}</strong><small>{detail}</small></span></>;
            return href ? <Link className="activity-item" href={href} key={href}>{body}</Link> : <div className="activity-item" key={title}>{body}</div>;
          })}</div>
        </section>
        <section className="surface-card recommendations">
          <div className="section-header"><div><p className="eyebrow">SIGUE EXPLORANDO</p><h2>Para ti</h2></div><Sparkles size={20} className="section-icon" /></div>
          {!recommendedCourses.length && <p className="learning-empty">Por ahora no hay otros cursos para recomendarte.</p>}
          <div className="recommendation-list">{recommendedCourses.map((course) => <Link className="recommendation-item" href={`/cursos/${course.slug}`} key={course.slug}><span className="recommendation-symbol">{course.symbol}</span><span><strong>{course.title}</strong><small>{course.level} · {course.durationHours} h</small></span></Link>)}</div>
        </section>
      </div>
    </div>
  );
}
