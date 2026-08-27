import type { ReactNode } from "react";
import { DashboardGate } from "@/components/dashboard/DashboardGate";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return <DashboardGate role="student">{children}</DashboardGate>;
}
