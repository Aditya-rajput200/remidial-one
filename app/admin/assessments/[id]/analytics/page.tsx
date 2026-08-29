"use client";

import { useParams } from "next/navigation";
import { AssessmentAnalyticsView } from "@/components/assessment/AssessmentAnalyticsView";

// Admin gets read-only oversight — publishing/moderating another mentor's
// results requires the explicit assessments.moderate grant (withheld from
// ADMIN by default, see lib/auth/permissions.ts), so the publish action is
// hidden here rather than surfaced and then rejected server-side.
export default function AdminAssessmentAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  return <AssessmentAnalyticsView id={id} allowPublish={false} />;
}
