"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ListChecks, AlertTriangle, Repeat } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

type AssessmentDetail = {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  subjectName: string | null;
  durationMinutes: number;
  totalMarks: string;
  passingMarks: string | null;
  attemptLimit: number;
  negativeMarkingEnabled: boolean;
  calculatorAllowed: boolean;
  moduleCount: number;
  questionCount: number;
  status: string;
};

export default function AssessmentInstructionsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/student/assessments/${id}`);
      if (cancelled || !res.ok) return;
      const body = await res.json();
      setAssessment(body.assessment as AssessmentDetail);
      setAttemptsUsed((body.attempts as { status: string }[]).length);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleStart() {
    setStarting(true);
    setError("");
    const res = await fetch(`/api/student/assessments/${id}/start`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    setStarting(false);
    if (!res.ok) {
      setError(body?.error ?? "Could not start the assessment.");
      return;
    }
    router.push(`/assessment/${body.attemptId}/take`);
  }

  if (assessment === null) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div>
      <PageHeader title={assessment.title} description={assessment.description ?? undefined} />
      <Card className="max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold text-ink">Before you begin</h2>
        <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
          <Info icon={Clock} label="Duration" value={`${assessment.durationMinutes} min`} />
          <Info icon={ListChecks} label="Questions" value={`${assessment.questionCount} across ${assessment.moduleCount} modules`} />
          <Info icon={Repeat} label="Attempts" value={`${attemptsUsed} of ${assessment.attemptLimit} used`} />
          <Info icon={AlertTriangle} label="Negative Marking" value={assessment.negativeMarkingEnabled ? "Enabled" : "Disabled"} />
        </div>
        {assessment.instructions ? (
          <div className="mb-6 whitespace-pre-wrap rounded-xl bg-surface p-4 text-sm text-muted">{assessment.instructions}</div>
        ) : null}
        <ul className="mb-6 list-disc space-y-1.5 pl-5 text-sm text-muted">
          <li>The timer starts as soon as you click Start and cannot be paused.</li>
          <li>Your answers autosave as you go — if you lose connection, reopen this test to resume.</li>
          <li>You&apos;ll see a confirmation screen before final submission.</li>
        </ul>
        {error ? <p className="mb-4 text-sm font-medium text-error">{error}</p> : null}
        <Button
          variant="primary-lime"
          size="lg"
          onClick={handleStart}
          disabled={starting || attemptsUsed >= assessment.attemptLimit}
        >
          {starting ? "Starting…" : "Start Assessment"}
        </Button>
      </Card>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lime-soft text-ink">
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}
