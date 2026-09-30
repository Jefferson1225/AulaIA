import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from "lucide-react";

type AuthViewProps = {
  configured: boolean;
  demoAvailable: boolean;
  mode?: "login" | "register";
  status?: string;
  action?: (formData: FormData) => void | Promise<void>;
};

const statusMessages: Record<string, string> = {
  datos_invalidos: "Revisa los datos ingresados e inténtalo de nuevo.",
  credenciales_invalidas: "Correo o contraseña incorrectos.",
  registro_fallido: "No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.",
  confirma_correo: "Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.",
};

export function LoginView({ configured, demoAvailable, mode = "login", status, action }: AuthViewProps) {
  const registering = mode === "register";
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
          <span className="preview-badge"><CheckCircle2 size={15} /> {configured ? "ACCESO A AULAIA" : "VISTA DE EJEMPLO"}</span>
          <h2>{registering ? "Crea tu cuenta" : "Bienvenido de nuevo"}</h2>
          <p>{registering ? "Empieza a aprender con AulaIA." : "Accede a tu espacio de aprendizaje."}</p>
          {status && statusMessages[status] && <p className="auth-feedback" role="status">{statusMessages[status]}</p>}
          <form action={action} className="auth-fields">
            {registering && <><label htmlFor="auth-name">Nombre completo</label><input id="auth-name" name="fullName" type="text" autoComplete="name" required disabled={!configured} /></>}
            <label htmlFor="auth-email">Correo electrónico</label>
            <input id="auth-email" name="email" type="email" autoComplete="email" placeholder="tucorreo@ejemplo.com" required disabled={!configured} />
            <label htmlFor="auth-password">Contraseña</label>
            <input id="auth-password" name="password" type="password" autoComplete={registering ? "new-password" : "current-password"} minLength={registering ? 8 : undefined} required disabled={!configured} />
            {configured && <button className="button button-primary auth-demo-button" type="submit">{registering ? "Crear cuenta" : "Iniciar sesión"} <ArrowRight size={18} /></button>}
          </form>
          {configured ? <p className="auth-note">{registering ? <>¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>.</> : <>¿Aún no tienes cuenta? <Link href="/registro">Regístrate</Link>.</>}</p> : <p className="auth-note">Configura Supabase para habilitar el acceso real.</p>}
          {demoAvailable && <Link className="button button-outline auth-demo-button" href="/inicio">Explorar demostración</Link>}
        </div>
      </section>
    </main>
  );
}
