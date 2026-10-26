"use client";

import { useFormStatus } from "react-dom";

export function LearningSubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button type="submit" className="button button-primary" disabled={pending}>{pending ? "Guardando…" : children}</button>;
}
