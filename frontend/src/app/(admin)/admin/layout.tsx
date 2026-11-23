import type { ReactNode } from "react";
import { requireContentAdmin } from "@aulaia/backend/infrastructure/supabase/admin-access";
import { AdminShell } from "../../../presentation/components/AdminShell";
import { signOut } from "@aulaia/backend/interfaces/actions/auth";
import "../../../presentation/admin.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireContentAdmin();
  return <AdminShell signOutAction={signOut}>{children}</AdminShell>;
}
