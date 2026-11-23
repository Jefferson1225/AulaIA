import type { Metadata } from "next";
import { requireContentAdmin } from "@aulaia/backend/infrastructure/supabase/admin-access";
import { AdminHomeView } from "../../../presentation/views/AdminHomeView";

export const metadata: Metadata = { title: "Panel de administración · AulaIA" };

export default async function AdminHomePage() {
  await requireContentAdmin();
  return <AdminHomeView />;
}
