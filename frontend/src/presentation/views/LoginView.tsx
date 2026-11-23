import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CircleCheck, Compass, MessageCircle } from "lucide-react";
import { AuthPassword } from "../components/AuthPassword";
import { LearningSubmitButton } from "../components/LearningSubmitButton";

type AuthViewProps = {
  configured: boolean;
  demoAvailable: boolean;
  mode?: "login" | "register";
  status?: string;
  action?: (formData: FormData) => void | Promise<void>;
};

const firstSteps = [
  { icon: Compass, title: "Elige un curso", description: "Busca un tema en el catálogo y matricúlate." },
  { icon: BookOpen, title: "Estudia a tu ritmo", description: "Completa lecciones y retoma el curso desde tu panel." },
  { icon: MessageCircle, title: "Pregunta cuando lo necesites", description: "Abre el Tutor IA desde la esquina de la lección." },
];

const statusMessages: Record<string, string> = {
  datos_invalidos: "Revisa los datos ingresados e inténtalo de nuevo.",
  credenciales_invalidas: "Correo o contraseña incorrectos.",
  registro_fallido: "No pudimos crear la cuenta. Revisa los datos e inténtalo de nuevo.",
  confirma_correo: "Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.",
  confirmacion_fallida: "El enlace de confirmación no es válido o ya venció. Si ya confirmaste tu correo, inicia sesión.",
};

export function LoginView({ configured, demoAvailable, mode = "login", status, action }: AuthViewProps) {
  const registering = mode === "register";
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <div className="auth-story-inner">
          <Image src="/brand/logo-aulaia.png" alt="AulaIA" width={165} height={56} priority />
          <div className="auth-story-copy">
            <h2>Tu espacio de estudio</h2>
            <ol className="auth-steps">
              {firstSteps.map(({ icon: Icon, title, description }) => <li className="auth-feature" key={title}>
                <span><Icon size={22} aria-hidden="true" /></span><div><strong>{title}</strong><small>{description}</small></div>
              </li>)}
            </ol>
          </div>
        </div>
      </section>
      <section className="auth-form-area">
        <div className="auth-form-card">
          <Image className="auth-mobile-logo" src="/brand/logo-aulaia.png" alt="AulaIA" width={135} height={45} />
          <h1>{registering ? "Crea tu cuenta" : "Inicia sesión"}</h1>
          <p>{registering ? "Usa un correo al que tengas acceso. Podrías recibir un enlace para confirmar tu cuenta." : "Vuelve a tus cursos y continúa donde lo dejaste."}</p>
          {status && Object.hasOwn(statusMessages, status) && <p className={`auth-feedback${status === "confirma_correo" ? " auth-success" : ""}`} role="status">{status === "confirma_correo" && <CircleCheck size={19} />}{statusMessages[status]}</p>}
          <form action={action} className="auth-fields">
            {registering && <><label htmlFor="auth-name">Nombre completo</label><input id="auth-name" name="fullName" type="text" autoComplete="name" required disabled={!configured} /></>}
            <label htmlFor="auth-email">{registering ? "Correo electrónico" : "Correo electrónico o usuario"}</label>
            <input id="auth-email" name="email" type={registering ? "email" : "text"} autoComplete={registering ? "email" : "username"} placeholder={registering ? "tucorreo@ejemplo.com" : "Correo o usuario"} required disabled={!configured} />
            <AuthPassword registering={registering} disabled={!configured} />
            {configured && <LearningSubmitButton pendingLabel={registering ? "Creando cuenta…" : "Iniciando sesión…"}>{registering ? "Crear cuenta" : "Iniciar sesión"} <ArrowRight size={18} /></LearningSubmitButton>}
          </form>
          {configured ? <p className="auth-note">{registering ? <>¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>.</> : <>¿Aún no tienes cuenta? <Link href="/registro">Crea una cuenta</Link>.</>}</p> : <p className="auth-note">El acceso está desactivado en la demostración.</p>}
          {demoAvailable && <Link className="button button-outline auth-demo-button" href="/inicio">Explorar demostración</Link>}
        </div>
      </section>
    </main>
  );
}
