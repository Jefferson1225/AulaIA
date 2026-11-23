"use client";

import { useFormStatus } from "react-dom";

export function LearningSubmitButton({ children, pendingLabel = "Guardando…" }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="button button-primary" disabled={pending}>{pending ? pendingLabel : children}</button>;
}
