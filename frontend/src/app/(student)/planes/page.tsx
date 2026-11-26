import type { Metadata } from "next";
import { PlansView } from "@/presentation/views/PlansView";

export const metadata: Metadata = { title: "Planes · AulaIA" };

export default function StudentPlansPage() {
  return <PlansView />;
}
