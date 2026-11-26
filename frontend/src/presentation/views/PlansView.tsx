import { BookOpen, GraduationCap, Info, Layers, MessageCircle } from "lucide-react";
import "../plans.css";

const plans = [
  { name: "Básico", price: "Gratis", dailyQuota: 10, icon: GraduationCap, access: "Cursos, lecciones y evaluaciones" },
  { name: "Plus", price: "Precio por definir", dailyQuota: 30, icon: Layers, access: "Todo lo del Básico y práctica adicional por definir" },
];

export function PlansView() {
  return (
    <div className="view-container plans-view">
      <header className="page-heading">
        <div>
          <h1>Planes de AulaIA</h1>
          <p>Propuesta de planes para el Tutor IA. La contratación estará disponible en una etapa posterior.</p>
        </div>
      </header>

      <div className="plans-grid">
        {plans.map(({ name, price, dailyQuota, icon: Icon, access }) => (
          <article key={name} className="plans-card">
            <header className="plans-card-header">
              <span className="study-icon"><Icon size={25} aria-hidden="true" /></span>
              <div>
                <h2>{name}</h2>
                <p>{price}</p>
              </div>
            </header>
            <ul className="plans-features">
              <li>
                <span className="study-icon"><MessageCircle size={21} aria-hidden="true" /></span>
                <span><strong>{dailyQuota}</strong> consultas al Tutor IA al día</span>
              </li>
              <li>
                <span className="study-icon"><BookOpen size={21} aria-hidden="true" /></span>
                <span>{access}</span>
              </li>
            </ul>
          </article>
        ))}
      </div>

      <aside className="plans-note" aria-label="Cupo vigente del Tutor IA">
        <Info size={20} aria-hidden="true" />
        <div>
          <strong>Cupo vigente del Tutor IA</strong>
          <p>Durante el prototipo, cada cuenta puede realizar hasta 30 consultas diarias, sujetas al presupuesto general del tutor.</p>
        </div>
      </aside>
    </div>
  );
}
