"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChartNoAxesCombined, ChevronRight, Compass, GraduationCap, House, LogOut, Menu, Search, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { Profile } from "../../domain/profile";

const navigation = [
  { href: "/inicio", label: "Inicio", icon: House },
  { href: "/catalogo", label: "Catálogo", icon: Compass },
  { href: "/inicio#mis-cursos", label: "Mi aprendizaje", icon: BookOpen },
  { href: "/inicio#progreso", label: "Progreso", icon: ChartNoAxesCombined },
];

const roleLabels = { student: "Estudiante", teacher: "Docente", admin: "Administrador" };

export function StudentShell({ children, profile, email, demo = false, signOutAction }: { children: ReactNode; profile?: Profile | null; email?: string; demo?: boolean; signOutAction?: () => Promise<void> }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = demo ? "Valentina Rojas" : profile?.fullName || email || "Cuenta";
  const initials = displayName.split(/[\s@]/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");

  return (
    <div className="student-shell">
      {menuOpen && <button className="sidebar-backdrop" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />}
      <aside className={`student-sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Link href="/inicio" onClick={() => setMenuOpen(false)} aria-label="AulaIA, ir al inicio">
            <Image src="/brand/logo-aulaia.png" alt="AulaIA" width={150} height={50} priority />
          </Link>
          <span className="sidebar-role">{demo ? "Estudiante" : profile ? roleLabels[profile.role] : "Cuenta"}</span>
          <button className="sidebar-close" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)}><X size={20} /></button>
        </div>
        <nav aria-label="Navegación del estudiante" className="sidebar-nav">
          <span className="nav-caption">APRENDIZAJE</span>
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`nav-link ${pathname === href ? "nav-link-active" : ""}`}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
              {pathname === href && <ChevronRight size={15} className="nav-chevron" />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note"><GraduationCap size={20} /><span>Aprende a tu ritmo, con apoyo en cada paso.</span></div>
          {demo ? <Link className="nav-link" href="/login"><LogOut size={19} strokeWidth={1.8} /><span>Volver al acceso</span></Link> : <form action={signOutAction}><button className="nav-link sidebar-signout" type="submit"><LogOut size={19} strokeWidth={1.8} /><span>Cerrar sesión</span></button></form>}
          <div className="sidebar-profile"><span className="profile-avatar">{initials}</span><span><strong>{displayName}</strong><small>{demo ? "Cuenta de demostración" : email}</small></span></div>
        </div>
      </aside>
      <div className="student-main">
        <header className="student-topbar">
          <button className="menu-toggle" aria-label="Abrir menú" onClick={() => setMenuOpen(true)}><Menu size={23} /></button>
          <Link href="/catalogo" className="top-search"><Search size={19} /><span>Buscar cursos, temas o lecciones…</span></Link>
          <span className="topbar-spacer" />
          {demo && <span className="topbar-preview">Vista de demostración</span>}
          <span className="profile-avatar topbar-avatar">{initials}</span>
        </header>
        <main className="student-content">{children}</main>
      </div>
    </div>
  );
}
