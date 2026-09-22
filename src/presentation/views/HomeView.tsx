import Link from "next/link";
import { ArrowRight, BookOpenCheck, ClipboardList, Clock3, Lightbulb, Play, Sparkles } from "lucide-react";
import type { Course, LearningActivity } from "../../domain/course";
import { CourseCard } from "../components/CourseCard";
import { ProgressBar } from "../components/ProgressBar";

interface HomeViewProps {
  continueCourse: Course | null;
  enrolledCourses: Course[];
  recommendedCourses: Course[];
  activities: LearningActivity[];
}

const activityIcons = { evaluation: ClipboardList, lesson: Play, practice: Lightbulb };

export function HomeView({ continueCourse, enrolledCourses, recommendedCourses, activities }: HomeViewProps) {
  return (
    <div className="view-container">
      <div className="page-heading">
        <div><p className="eyebrow">TU ESPACIO DE APRENDIZAJE</p><h1>Buenos días, Valentina<span className="title-period">.</span></h1><p>Continúa donde lo dejaste y descubre lo que sigue.</p></div>
        <Link href="/catalogo" className="button button-outline">Explorar catálogo <ArrowRight size={17} /></Link>
      </div>

      {continueCourse && <section className="continue-panel" id="progreso" aria-label="Continuar aprendiendo">
        <div className="continue-decoration" aria-hidden="true">⟨/⟩</div>
        <div className="continue-content">
          <p className="continue-eyebrow"><Sparkles size={16} /> CONTINUAR APRENDIENDO</p>
          <h2>{continueCourse.title}</h2>
          <p>Retoma la lección <strong>Variables y tipos de datos</strong> del Módulo 1.</p>
          <ProgressBar value={continueCourse.progress ?? 0} label="Progreso del curso" />
          <div className="continue-actions">
            <Link href="/cursos/fundamentos-python/lecciones/variables-y-tipos" className="button button-primary"><Play size={17} fill="currentColor" /> Continuar lección</Link>
            <span><Clock3 size={16} /> 3 h restantes aprox.</span>
          </div>
        </div>
      </section>}

      <section className="section-block" id="mis-cursos">
        <div className="section-header"><div><p className="eyebrow">EN TU CAMINO</p><h2>Mis cursos</h2></div><Link href="/catalogo" className="text-link">Ver catálogo <ArrowRight size={16} /></Link></div>
        <div className="course-grid">{enrolledCourses.map((course) => <CourseCard key={course.slug} course={course} compact />)}</div>
      </section>

      <div className="home-bottom-grid">
        <section className="surface-card">
          <div className="section-header"><div><p className="eyebrow">A CONTINUACIÓN</p><h2>Próximas actividades</h2></div><BookOpenCheck size={21} className="section-icon" /></div>
          <div className="activity-list">{activities.map(({ title, detail, kind }) => {
            const Icon = activityIcons[kind];
            return <div className="activity-item" key={title}><span className="activity-icon"><Icon size={19} /></span><span><strong>{title}</strong><small>{detail}</small></span></div>;
          })}</div>
        </section>
        <section className="surface-card recommendations">
          <div className="section-header"><div><p className="eyebrow">SIGUE EXPLORANDO</p><h2>Para ti</h2></div><Sparkles size={20} className="section-icon" /></div>
          <div className="recommendation-list">{recommendedCourses.map((course) => <div className="recommendation-item" key={course.slug}><span className="recommendation-symbol">{course.symbol}</span><span><strong>{course.title}</strong><small>{course.level} · {course.durationHours} h</small></span></div>)}</div>
        </section>
      </div>
    </div>
  );
}
