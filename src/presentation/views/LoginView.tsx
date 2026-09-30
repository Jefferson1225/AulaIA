import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from "lucide-react";

export function LoginView() {
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <div className="auth-story-inner">
          <Image src="/brand/logo-aulaia.png" alt="AulaIA" width={184} height={62} priority />
          <div className="auth-story-copy">
            <span className="auth-kicker"><Sparkles size={16} /> APRENDIZAJE CON IA</span>
            <h1>Tu próxima gran idea empieza aquí<span className="title-period">.</span></h1>
            <p>Aprende a tu ritmo, explora cursos útiles y recibe apoyo contextual mientras estudias.</p>
            <div className="auth-feature"><span><BookOpen size={21} /></span><div><strong>Contenido que avanza contigo</strong><small>Lecciones, progreso y actividades en un solo lugar.</small></div></div>
            <div className="auth-feature"><span><Sparkles size={21} /></span><div><strong>Un tutor dentro de la lección</strong><small>Respuestas conectadas con el tema que estás aprendiendo.</small></div></div>
          </div>
          <p className="auth-copyright">© 2026 AulaIA · Proyecto académico</p>
        </div>
        <div className="auth-orbit auth-orbit-one" aria-hidden="true" />
        <div className="auth-orbit auth-orbit-two" aria-hidden="true" />
      </section>
      <section className="auth-form-area">
        <div className="auth-form-card">
          <span className="preview-badge"><CheckCircle2 size={15} /> VISTA DE EJEMPLO</span>
          <h2>Bienvenido de nuevo</h2>
          <p>Explora cómo será tu espacio de aprendizaje.</p>
          <div className="auth-fields" aria-label="Formulario de acceso en desarrollo">
            <label htmlFor="demo-email">Correo electrónico</label>
            <input id="demo-email" type="email" placeholder="tucorreo@ejemplo.com" disabled />
            <label htmlFor="demo-password">Contraseña</label>
            <input id="demo-password" type="password" placeholder="••••••••" disabled />
          </div>
          <Link className="button button-primary auth-demo-button" href="/inicio">Entrar como estudiante <ArrowRight size={18} /></Link>
          <p className="auth-note">La autenticación con Supabase se incorporará en la siguiente etapa. Este acceso abre una vista de demostración.</p>
        </div>
      </section>
    </main>
  );
}
