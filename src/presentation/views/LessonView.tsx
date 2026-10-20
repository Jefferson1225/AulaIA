import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronRight, Clock3, Lightbulb, LockKeyhole, MessageCircle, Sparkles } from "lucide-react";
import type { Lesson } from "../../domain/course";
import { TutorChat } from "../components/TutorChat";

export function LessonView({ lesson, tutorAvailable = false }: { lesson: Lesson; tutorAvailable?: boolean }) {
  const courseUrl = `/cursos/${lesson.courseSlug}`;
  const courseTitle = lesson.courseTitle ?? lesson.courseSlug;
  const moduleLessons = lesson.moduleLessons ?? [{ slug: lesson.slug, title: lesson.title, durationMinutes: lesson.durationMinutes }];
  return (
    <div className="learning-layout">
      <header className="learning-header">
        <Link href="/inicio" aria-label="Volver al inicio" className="learning-brand"><Image src="/brand/logo-aulaia.png" alt="AulaIA" width={118} height={40} priority /></Link>
        <span className="learning-divider" />
        <div className="learning-crumb"><Link href={courseUrl}>{courseTitle}</Link><ChevronRight size={15} /><span>{lesson.moduleTitle}</span></div>
      </header>
      <div className="learning-grid">
        <aside className="lesson-sidebar">
          <Link href={courseUrl} className="lesson-back"><ArrowLeft size={17} /> Volver al curso</Link>
          <p className="eyebrow">CONTENIDO DEL CURSO</p>
          <h2>{courseTitle}</h2>
          <div className="module-heading"><BookOpen size={17} /> {lesson.moduleTitle}</div>
          <ol className="lesson-list">
            {moduleLessons.map((item, index) => <li key={item.slug} className={item.slug === lesson.slug ? "lesson-current" : undefined}>
              <span className="lesson-status">{index + 1}</span>
              <Link href={`/cursos/${lesson.courseSlug}/lecciones/${item.slug}`}>{item.title}<small>{item.durationMinutes} min{item.slug === lesson.slug ? " · actual" : ""}</small></Link>
            </li>)}
          </ol>
        </aside>
        <main className="lesson-main">
          <article className="lesson-article">
            <p className="eyebrow">LECCIÓN {lesson.number} DE {lesson.totalLessons}</p>
            <h1>{lesson.title}</h1>
            <p className="lesson-intro">{lesson.intro}</p>
            <div className="lesson-meta"><span><Clock3 size={16} /> {lesson.durationMinutes} min</span><span><BookOpen size={16} /> {lesson.courseLevel ?? "Curso"}</span></div>
            <div className="lesson-media"><span className="media-symbol"><BookOpen size={38} /></span><strong>Aprende a tu ritmo</strong><small>{lesson.moduleTitle}</small></div>
            <div className="lesson-prose">
              {lesson.sections.map((section) => <section key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
                {section.code && <pre><code>{section.code}</code></pre>}
                {section.items && <ul>{section.items.map((item) => <li key={item.label}><code>{item.label}</code> — {item.description}</li>)}</ul>}
              </section>)}
              {lesson.tip && <div className="lesson-tip"><Lightbulb size={19} /><p>{lesson.tip}</p></div>}
            </div>
            <div className="lesson-footer"><Link href={courseUrl} className="button button-outline"><ArrowLeft size={17} /> Volver al curso</Link><span>Seguimiento de progreso próximamente</span></div>
          </article>
        </main>
        {tutorAvailable ? <TutorChat courseSlug={lesson.courseSlug} lessonSlug={lesson.slug} lessonTitle={lesson.title} /> : <aside className="tutor-panel">
          <div className="tutor-heading"><span className="tutor-icon"><Sparkles size={21} /></span><div><strong>Tutor IA · Vista previa</strong><small>Contexto: {lesson.title}</small></div></div>
          <div className="tutor-conversation">
            <div className="tutor-intro"><MessageCircle size={20} /><p>Este panel acompañará al estudiante mientras estudia la lección.</p></div>
            <div className="message message-user"><span>TÚ</span>¿Me explicas esta lección de otra manera?</div>
            <div className="message message-ai"><span><Sparkles size={13} /> VISTA PREVIA</span>El tutor podrá responder según el contenido de esta lección cuando se configure el servicio de IA.</div>
          </div>
          <div className="tutor-bottom"><div className="tutor-suggestions"><span>Sugerencias de ejemplo</span><span>Explícame este tema</span><span>Dame un ejemplo</span></div><div className="tutor-placeholder">Escribe tu pregunta… <LockKeyhole size={16} /></div><p>La conversación en tiempo real se habilitará al integrar DeepSeek.</p></div>
        </aside>}
      </div>
    </div>
  );
}
