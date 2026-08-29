"use client";

import { useParams } from "next/navigation";
import { AssessmentAnalyticsView } from "@/components/assessment/AssessmentAnalyticsView";

export default function AssessmentAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  return <AssessmentAnalyticsView id={id} />;
}
