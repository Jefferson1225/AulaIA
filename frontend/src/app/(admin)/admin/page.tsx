import type { Metadata } from "next";
import { requireAdminForRender } from "@/app/render-data";
import { AdminHomeView } from "../../../presentation/views/AdminHomeView";

export const metadata: Metadata = { title: "Panel de administración · AulaIA" };

export default async function AdminHomePage() {
  await requireAdminForRender();
  return <AdminHomeView />;
}
