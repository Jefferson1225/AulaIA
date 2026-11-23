"use client";

import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react";
import { Bot, ChevronDown, Sparkles, X } from "lucide-react";

const invitationKey = "aulaia:tutor:last-invitation";
const invitationCooldown = 20 * 60 * 1000;

function rememberInvitation() {
  try { sessionStorage.setItem(invitationKey, String(Date.now())); }
  catch { /* El tutor sigue funcionando cuando el navegador bloquea el almacenamiento. */ }
}

/** Panel no modal: permite consultar al tutor y seguir leyendo la clase. */
export function FloatingTutor({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [showInvitation, setShowInvitation] = useState(false);
  const panelId = useId();
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);

  const close = useCallback(() => {
    setOpen(false);
    launcher.current?.focus();
  }, []);

  function dismissInvitation() {
    interacted.current = true;
    rememberInvitation();
    setShowInvitation(false);
  }

  function openTutor() {
    dismissInvitation();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const input = panel.current?.querySelector<HTMLElement>("input:not(:disabled), textarea:not(:disabled)");
    (input ?? panel.current?.querySelector<HTMLButtonElement>("button"))?.focus();
    const conversation = panel.current?.querySelector<HTMLElement>(".tutor-conversation");
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); close(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (open || interacted.current) return;
    try {
      const previous = Number(sessionStorage.getItem(invitationKey));
      if (previous > 0 && Date.now() - previous < invitationCooldown) return;
    } catch { /* El recordatorio también funciona sin almacenamiento. */ }
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const showTimer = setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      interacted.current = true;
      rememberInvitation();
      setShowInvitation(true);
      hideTimer = setTimeout(() => setShowInvitation(false), 10000);
    }, 25000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [open]);

  return <div className="floating-tutor">
    {showInvitation && !open && <div className="tutor-invitation" aria-live="polite">
      <button type="button" className="tutor-invitation-content" onClick={openTutor}>
        <span className="tutor-invitation-icon"><Sparkles size={18} /></span>
        <span><strong>¿Necesitas ayuda?</strong><small>Podemos repasar esta lección juntos.</small></span>
      </button>
      <button type="button" className="tutor-invitation-dismiss" aria-label="Descartar ayuda" onClick={dismissInvitation}><X size={16} /></button>
    </div>}
    <div ref={panel} id={panelId} className="floating-tutor-panel" role="dialog" aria-label="Tutor IA de la lección" hidden={!open}>
      <button type="button" className="tutor-minimize" aria-label="Minimizar Tutor IA" onClick={close}><ChevronDown size={22} /></button>
      {children}
    </div>
    <button ref={launcher} type="button" className="tutor-launcher" aria-label={open ? "Cerrar Tutor IA" : "Abrir Tutor IA"}
      aria-expanded={open} aria-controls={panelId} aria-haspopup="dialog" onClick={open ? close : openTutor}>
      {open ? <X size={26} /> : <Bot size={28} strokeWidth={1.8} />}
      {!open && <span className="tutor-launcher-caption" aria-hidden="true">Tutor IA</span>}
    </button>
  </div>;
}
