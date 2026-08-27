import type { ReactNode } from "react";
import { DashboardGate } from "@/components/dashboard/DashboardGate";

export default function MentorLayout({ children }: { children: ReactNode }) {
  return <DashboardGate role="mentor">{children}</DashboardGate>;
}
