"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BookOpen, ClipboardList, Layers, LayoutDashboard, LogOut, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { NavigationPending } from "./NavigationPending";

const adminNavigation = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/cursos", label: "Cursos y contenido", icon: BookOpen },
  { href: "/admin/evaluaciones", label: "Evaluaciones", icon: ClipboardList },
  { href: "/admin/tutor", label: "Tutor IA", icon: MessageCircle },
  { href: "/admin/planes", label: "Planes", icon: Layers },
];

export function AdminShell({ children, signOutAction }: { children: ReactNode; signOutAction: () => Promise<void> }) {
  const pathname = usePathname();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" aria-label="AulaIA administración"><Image src="/brand/logo-aulaia.png" alt="AulaIA" width={145} height={48} priority /></Link>
        <span className="admin-role">ADMINISTRACIÓN</span>
        <nav aria-label="Navegación de administración">
          {adminNavigation.map(({ href, label, icon: Icon }) => {
            const current = pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));
            return <Link key={href} href={href} aria-current={current ? "page" : undefined}><Icon size={18} aria-hidden="true" />{label}<NavigationPending /></Link>;
          })}
          <Link href="/inicio"><ArrowLeft size={18} aria-hidden="true" />Espacio de estudio<NavigationPending /></Link>
        </nav>
        <form action={signOutAction}><button type="submit"><LogOut size={18} aria-hidden="true" />Cerrar sesión</button></form>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
