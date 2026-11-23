"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function AuthPassword({ registering, disabled }: { registering: boolean; disabled: boolean }) {
  const [visible, setVisible] = useState(false);
  return <>
    <label htmlFor="auth-password">Contraseña</label>
    <div className="auth-password">
      <input id="auth-password" name="password" type={visible ? "text" : "password"}
        autoComplete={registering ? "new-password" : "current-password"}
        aria-describedby={registering ? "password-help" : undefined}
        minLength={registering ? 8 : undefined} required disabled={disabled} />
      <button type="button" onClick={() => setVisible(!visible)} disabled={disabled}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"} aria-controls="auth-password">
        {visible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
    {registering && <small className="auth-field-help" id="password-help">Usa al menos 8 caracteres.</small>}
  </>;
}
