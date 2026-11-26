import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminShell } from "../../frontend/src/presentation/components/AdminShell";
import { StudentShell } from "../../frontend/src/presentation/components/StudentShell";

const route = vi.hoisted(() => ({ pathname: "/planes" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

describe("acceso a los planes de AulaIA", () => {
  beforeEach(() => { route.pathname = "/planes"; });

  it("incluye Planes en el menú de una cuenta de estudiante", () => {
    render(<StudentShell profile={{ id: "student", fullName: "Estudiante", role: "student" }}>Contenido</StudentShell>);

    const nav = screen.getByRole("navigation", { name: "Navegación del estudiante" });
    const link = within(nav).getByRole("link", { name: "Planes" });

    expect(link).toHaveAttribute("href", "/planes");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("incluye Planes en el menú de administración", () => {
    route.pathname = "/admin/planes";
    render(<AdminShell signOutAction={async () => {}}>Contenido</AdminShell>);

    const nav = screen.getByRole("navigation", { name: "Navegación de administración" });
    const link = within(nav).getByRole("link", { name: "Planes" });

    expect(link).toHaveAttribute("href", "/admin/planes");
    expect(link).toHaveAttribute("aria-current", "page");
  });
});
