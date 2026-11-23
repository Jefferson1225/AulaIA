export function LearningFeedback({ status }: { status?: string }) {
  const messages: Record<string, string> = {
    matriculado: "Tu matrícula está registrada. Ya puedes guardar tu avance.",
    guardado: "El estado de la lección se guardó correctamente.",
    error: "No se pudo guardar el cambio. Comprueba tu matrícula e inténtalo de nuevo.",
  };
  const message = status && Object.hasOwn(messages, status) ? messages[status] : undefined;
  return message ? <p className={`learning-feedback ${status === "error" ? "learning-feedback-error" : ""}`} role="status">{message}</p> : null;
}
