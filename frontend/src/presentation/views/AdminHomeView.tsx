import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, MessageCircle } from "lucide-react";

const sections = [
  { icon: BookOpen, title: "Cursos y contenido", description: "Crea cursos, organiza sus lecciones y publica el material cuando esté listo.", href: "/admin/cursos", action: "Ver cursos" },
  { icon: ClipboardList, title: "Evaluaciones", description: "Crea evaluaciones, administra sus preguntas y decide cuándo publicarlas.", href: "/admin/evaluaciones", action: "Ver evaluaciones" },
  { icon: MessageCircle, title: "Tutor IA", description: "Consulta las valoraciones, el uso y el costo estimado de las consultas.", href: "/admin/tutor", action: "Ver métricas" },
];

export function AdminHomeView() {
  return <div className="admin-container">
    <header className="admin-heading">
      <h1>Panel de administración</h1>
      <p>Elige qué quieres gestionar en AulaIA.</p>
    </header>
    <div className="admin-shortcuts">
      {sections.map(({ icon: Icon, title, description, href, action }) => <Link key={href} href={href} className="admin-panel admin-shortcut">
        <span className="study-icon"><Icon size={24} aria-hidden="true" /></span>
        <h2>{title}</h2><p>{description}</p>
        <span className="text-link">{action} <ArrowRight size={16} /></span>
      </Link>)}
    </div>
    <Link href="/inicio" className="button button-outline admin-return">Volver al espacio de estudio</Link>
  </div>;
}
