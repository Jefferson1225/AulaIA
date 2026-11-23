import type { ReactNode } from "react";
import { requireAdminForRender } from "@/app/render-data";
import { AdminShell } from "../../../presentation/components/AdminShell";
import { signOut } from "@aulaia/backend/interfaces/actions/auth";
import "../../../presentation/admin.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminForRender();
  return <AdminShell signOutAction={signOut}>{children}</AdminShell>;
}
