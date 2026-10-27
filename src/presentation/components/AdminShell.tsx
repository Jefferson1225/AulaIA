import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function AdminShell({ children, signOutAction }: { children: ReactNode; signOutAction: () => Promise<void> }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin/cursos" aria-label="AulaIA administración"><Image src="/brand/logo-aulaia.png" alt="AulaIA" width={145} height={48} priority /></Link>
        <span className="admin-role">ADMINISTRACIÓN</span>
        <nav aria-label="Navegación de administración">
          <Link href="/admin/cursos">Cursos y contenido</Link>
          <Link href="/admin/evaluaciones">Evaluaciones</Link>
          <Link href="/catalogo">Ver catálogo</Link>
          <Link href="/inicio">Inicio del estudiante</Link>
        </nav>
        <form action={signOutAction}><button type="submit">Cerrar sesión</button></form>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
