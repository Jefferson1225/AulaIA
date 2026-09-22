import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, ChevronRight, Clock3, Code2, Lightbulb, LockKeyhole, MessageCircle, Sparkles } from "lucide-react";
import type { Lesson } from "../../domain/course";

export function LessonView({ lesson }: { lesson: Lesson }) {
  return (
    <div className="learning-layout">
      <header className="learning-header">
        <Link href="/inicio" aria-label="Volver al inicio" className="learning-brand"><Image src="/brand/logo-aulaia.png" alt="AulaIA" width={118} height={40} priority /></Link>
        <span className="learning-divider" />
        <div className="learning-crumb"><Link href="/inicio">Fundamentos de Python</Link><ChevronRight size={15} /><span>{lesson.moduleTitle}</span></div>
        <div className="learning-progress"><span>Progreso del curso <strong>62%</strong></span><div className="progress-track"><span style={{ width: "62%" }} /></div></div>
      </header>
      <div className="learning-grid">
        <aside className="lesson-sidebar">
          <Link href="/inicio" className="lesson-back"><ArrowLeft size={17} /> Volver a mi inicio</Link>
          <p className="eyebrow">CONTENIDO DEL CURSO</p>
          <h2>Fundamentos de Python</h2>
          <div className="module-heading"><BookOpen size={17} /> {lesson.moduleTitle}</div>
          <ol className="lesson-list">
            <li className="lesson-done"><span className="lesson-status"><Check size={12} /></span><span>Introducción a Python<small>12 min</small></span></li>
            <li className="lesson-current"><span className="lesson-status">2</span><span>{lesson.title}<small>{lesson.durationMinutes} min · actual</small></span></li>
            <li><span className="lesson-status">3</span><span>Estructuras de control<small>20 min</small></span></li>
            <li><span className="lesson-status">4</span><span>Bucles y repetición<small>16 min</small></span></li>
            <li><span className="lesson-status">5</span><span>Listas y tuplas<small>14 min</small></span></li>
            <li><span className="lesson-status"><LockKeyhole size={12} /></span><span>Evaluación del módulo<small>15 min</small></span></li>
          </ol>
        </aside>
        <main className="lesson-main">
          <article className="lesson-article">
            <p className="eyebrow">LECCIÓN {lesson.number} DE {lesson.totalLessons}</p>
            <h1>{lesson.title}</h1>
            <p className="lesson-intro">{lesson.intro}</p>
            <div className="lesson-meta"><span><Clock3 size={16} /> {lesson.durationMinutes} min</span><span><BookOpen size={16} /> Principiante</span></div>
            <div className="lesson-media"><span className="media-symbol"><Code2 size={38} /></span><strong>Aprender haciendo</strong><small>Una introducción práctica a Python</small></div>
            <div className="lesson-prose">
              {lesson.sections.map((section) => <section key={section.title}>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
                {section.code && <pre><code>{section.code}</code></pre>}
                {section.items && <ul>{section.items.map((item) => <li key={item.label}><code>{item.label}</code> — {item.description}</li>)}</ul>}
              </section>)}
              <div className="lesson-tip"><Lightbulb size={19} /><p>{lesson.tip}</p></div>
            </div>
            <div className="lesson-footer"><Link href="/inicio" className="button button-outline"><ArrowLeft size={17} /> Volver al inicio</Link><span>Seguimiento de progreso próximamente</span></div>
          </article>
        </main>
        <aside className="tutor-panel">
          <div className="tutor-heading"><span className="tutor-icon"><Sparkles size={21} /></span><div><strong>Tutor IA · Vista previa</strong><small>Contexto: Variables y tipos de datos</small></div></div>
          <div className="tutor-conversation">
            <div className="tutor-intro"><MessageCircle size={20} /><p>Este panel acompañará al estudiante mientras estudia la lección.</p></div>
            <div className="message message-user"><span>TÚ</span>¿Qué es una variable en Python?</div>
            <div className="message message-ai"><span><Sparkles size={13} /> EJEMPLO DE RESPUESTA</span>Una variable es como una etiqueta para guardar un dato. Si escribes <code>edad = 24</code>, podrás usar <code>edad</code> más adelante en tu programa.</div>
          </div>
          <div className="tutor-bottom"><div className="tutor-suggestions"><span>Sugerencias de ejemplo</span><span>Explícame este tema</span><span>Dame un ejemplo</span></div><div className="tutor-placeholder">Escribe tu pregunta… <LockKeyhole size={16} /></div><p>La conversación en tiempo real se habilitará al integrar DeepSeek.</p></div>
        </aside>
      </div>
    </div>
  );
}
