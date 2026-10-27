import type { Metadata } from "next";
import { requireContentAdmin } from "../../../../infrastructure/supabase/admin-access";

export const metadata: Metadata = { title: "Métricas del Tutor IA · AulaIA" };
interface Metrics {
  total: number; succeeded: number; failed: number; pending: number; meanLatencyMs: number | null;
  promptTokens: number; completionTokens: number; estimatedCostUsd: number;
  rated: number; positive: number; negative: number; truncated: number; models: string[];
}
export default async function TutorMetricsPage() {
  const client = await requireContentAdmin();
  const { data, error } = await client.rpc("get_tutor_metrics");
  if (error || !data) return <div className="admin-container"><h1>Métricas del Tutor IA</h1><p role="alert">No se pudieron consultar las métricas.</p></div>;
  const metrics = data as Metrics;
  const budget = Number(process.env.TUTOR_MAX_BUDGET_USD ?? 0);
  const values = [
    ["Consultas registradas", metrics.total], ["Respuestas obtenidas", metrics.succeeded],
    ["Consultas fallidas", metrics.failed], ["Sin resultado confirmado", metrics.pending],
    ["Tiempo medio de respuesta", metrics.meanLatencyMs === null ? "Sin datos" : `${(metrics.meanLatencyMs / 1000).toFixed(2)} s`],
    ["Tokens de entrada", metrics.promptTokens.toLocaleString("es-PE")], ["Tokens de salida", metrics.completionTokens.toLocaleString("es-PE")],
    ["Costo estimado y reservas", `US$ ${Number(metrics.estimatedCostUsd).toFixed(6)}`],
    ["Presupuesto acumulado", Number.isFinite(budget) ? `US$ ${budget.toFixed(2)}` : "Desactivado"],
    ["Valoraciones recibidas", metrics.rated], ["Valoraciones útiles", metrics.positive], ["Respuestas reportadas", metrics.negative],
    ["Respuestas con límite de extensión", metrics.truncated],
  ];
  return <div className="admin-container"><header className="admin-heading"><p className="eyebrow">SEGUIMIENTO DEL ASISTENTE</p><h1>Métricas del Tutor IA<span className="title-period">.</span></h1><p>Datos acumulados del proyecto. Actualiza la página para consultar los últimos registros.</p></header>
    <section className="admin-panel"><h2>Uso y disponibilidad</h2><dl className="tutor-metrics">{values.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
    <section className="admin-panel"><h2>Criterios de lectura</h2><p>El tiempo medio corresponde a las consultas que obtuvieron una respuesta. El costo usa la tarifa máxima de Flash sin descuentos por caché u horario; los fallos y consultas pendientes conservan su reserva por precaución. Este importe no sustituye al saldo del proveedor.</p><p>Las valoraciones reflejan opiniones sobre respuestas individuales. Por sí solas no demuestran mejora del aprendizaje ni exactitud académica.</p><p>Modelos registrados: {metrics.models.length ? metrics.models.join(", ") : "Sin consultas completadas"}.</p></section>
  </div>;
}
