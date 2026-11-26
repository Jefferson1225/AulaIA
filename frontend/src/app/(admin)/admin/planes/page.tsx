import type { Metadata } from "next";
import { PlansView } from "@/presentation/views/PlansView";

export const metadata: Metadata = { title: "Planes · Administración de AulaIA" };

export default function AdminPlansPage() {
  return <PlansView />;
}
