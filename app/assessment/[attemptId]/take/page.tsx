"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Flag, ChevronLeft, ChevronRight, Menu, X, CheckCircle2 } from "lucide-react";
import { useSession } from "@/lib/auth/SessionProvider";
import { Button } from "@/components/ui/Button";
import { AnswerInput } from "@/components/assessment/AnswerInput";
import { MathText } from "@/components/assessment/MathText";

type QuestionItem = {
  moduleQuestionId: string;
  marks: number;
  negativeMarks: number;
  question: { id: string; type: string; text: string; content: Record<string, unknown>; media: unknown };
  state: string;
  response: Record<string, unknown> | null;
  attachments: { id: string; fileUrl: string; fileName: string }[];
};

type ModuleData = { id: string; name: string; questions: QuestionItem[] };

type TakePayload = {
  attempt: { id: string; status: string; serverExpiresAt: string | null };
  assessment: { id: string; title: string; freeNavigation: boolean; negativeMarkingEnabled: boolean };
  modules: ModuleData[];
};

const STATE_COLOR: Record<string, string> = {
  NOT_VISITED: "bg-white border-border text-muted",
  VISITED: "bg-white border-border-strong text-ink",
  ANSWERED: "bg-lime text-white border-lime",
  MARKED_FOR_REVIEW: "bg-ink text-white border-ink",
  ANSWERED_MARKED: "bg-purple-600 text-white border-purple-600",
};

function localKey(attemptId: string, moduleQuestionId: string) {
  return `assessment:${attemptId}:${moduleQuestionId}`;
}

export default function TakeAssessmentPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const router = useRouter();
  const { session, ready } = useSession();

  const [data, setData] = useState<TakePayload | null>(null);
  const [moduleIndex, setModuleIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/login");
  }, [ready, session, router]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/student/attempts/${attemptId}`);
    if (!res.ok) {
      if (res.status === 400) setSubmitted(true);
      return;
    }
    const body = (await res.json()) as TakePayload;

    // Reconcile any answer saved to localStorage that never made it to the
    // server (e.g. a brief disconnect) — see the offline-fallback note in
    // the plan; this is a best-effort restore, not a full sync queue.
    for (const mod of body.modules) {
      for (const q of mod.questions) {
        if (q.response !== null) continue;
        const raw = window.localStorage.getItem(localKey(attemptId, q.moduleQuestionId));
        if (raw) {
          try {
            q.response = JSON.parse(raw);
          } catch {
            /* ignore corrupt cache entry */
          }
        }
      }
    }

    setData(body);
  }, [attemptId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    if (!data?.attempt.serverExpiresAt) return;
    const deadline = new Date(data.attempt.serverExpiresAt).getTime();
    const tick = () => setRemainingSeconds(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data?.attempt.serverExpiresAt]);

  const handleSubmit = useCallback(async () => {
    await fetch(`/api/student/attempts/${attemptId}/submit`, { method: "POST" });
    setSubmitted(true);
  }, [attemptId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (remainingSeconds === 0 && !submitted) handleSubmit();
  }, [remainingSeconds, submitted, handleSubmit]);

  const flatQuestions = useMemo(() => data?.modules.flatMap((m) => m.questions) ?? [], [data]);
  const currentModule = data?.modules[moduleIndex];
  const currentQuestion = currentModule?.questions[questionIndex];

  useEffect(() => {
    if (!currentQuestion) return;
    fetch(`/api/student/attempts/${attemptId}/visit/${currentQuestion.moduleQuestionId}`, { method: "POST" }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.moduleQuestionId]);

  function updateResponse(moduleQuestionId: string, response: Record<string, unknown>) {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        modules: prev.modules.map((m) => ({
          ...m,
          questions: m.questions.map((q) => (q.moduleQuestionId === moduleQuestionId ? { ...q, response, state: "ANSWERED" } : q)),
        })),
      };
    });

    window.localStorage.setItem(localKey(attemptId, moduleQuestionId), JSON.stringify(response));

    clearTimeout(saveTimers.current[moduleQuestionId]);
    saveTimers.current[moduleQuestionId] = setTimeout(async () => {
      const res = await fetch(`/api/student/attempts/${attemptId}/answers/${moduleQuestionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      if (res.ok) window.localStorage.removeItem(localKey(attemptId, moduleQuestionId));
    }, 600);
  }

  async function uploadAttachment(moduleQuestionId: string, file: File) {
    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch(`/api/student/attempts/${attemptId}/answers/${moduleQuestionId}/attachment`, { method: "POST", body: formData });
    if (res.ok) await load();
  }

  async function toggleMarkForReview() {
    if (!currentQuestion) return;
    const marked = currentQuestion.state !== "MARKED_FOR_REVIEW" && currentQuestion.state !== "ANSWERED_MARKED";
    await fetch(`/api/student/attempts/${attemptId}/mark-review/${currentQuestion.moduleQuestionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marked }),
    });
    await load();
  }

  function jumpTo(mIndex: number, qIndex: number) {
    setModuleIndex(mIndex);
    setQuestionIndex(qIndex);
    setPaletteOpen(false);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <CheckCircle2 className="h-12 w-12 text-lime" />
        <h1 className="text-2xl font-semibold text-ink">Assessment submitted successfully.</h1>
        <p className="max-w-md text-sm text-muted">
          Your answers have been recorded. Your mentor will publish your result once evaluation is complete.
        </p>
        <Button href="/student/assessments" variant="primary-black">
          Back to Assessments
        </Button>
      </div>
    );
  }

  if (!data || !currentModule || !currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" aria-hidden />
      </div>
    );
  }

  const answeredCount = flatQuestions.filter((q) => q.state === "ANSWERED" || q.state === "ANSWERED_MARKED").length;
  const minutes = remainingSeconds !== null ? Math.floor(remainingSeconds / 60) : null;
  const seconds = remainingSeconds !== null ? remainingSeconds % 60 : null;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center justify-between border-b border-border bg-white px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{data.assessment.title}</p>
          <p className="text-xs text-muted">{currentModule.name}</p>
        </div>
        <div className="flex items-center gap-4">
          {remainingSeconds !== null ? (
            <div className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${remainingSeconds < 60 ? "bg-error-soft text-error" : "bg-ink text-white"}`}>
              <Clock className="h-4 w-4" />
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
          ) : null}
          <button onClick={() => setPaletteOpen((v) => !v)} className="lg:hidden" aria-label="Question palette">
            {paletteOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-8">
          <div className="mx-auto w-full max-w-2xl flex-1">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
              Question {flatQuestions.indexOf(currentQuestion) + 1} of {flatQuestions.length} · {currentQuestion.marks} marks
              {data.assessment.negativeMarkingEnabled && currentQuestion.negativeMarks > 0 ? ` (-${currentQuestion.negativeMarks} if wrong)` : ""}
            </p>
            <MathText text={currentQuestion.question.text} className="mb-6 block text-lg font-medium leading-relaxed text-ink" />

            <AnswerInput
              type={currentQuestion.question.type}
              content={currentQuestion.question.content}
              response={currentQuestion.response}
              onChange={(response) => updateResponse(currentQuestion.moduleQuestionId, response)}
              onUploadAttachment={(file) => uploadAttachment(currentQuestion.moduleQuestionId, file)}
              attachments={currentQuestion.attachments}
            />
          </div>

          <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center gap-3 border-t border-border pt-5">
            <Button
              variant="secondary-outline"
              size="sm"
              onClick={() => (questionIndex > 0 ? setQuestionIndex(questionIndex - 1) : moduleIndex > 0 && jumpTo(moduleIndex - 1, data.modules[moduleIndex - 1].questions.length - 1))}
              disabled={moduleIndex === 0 && questionIndex === 0}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button variant="secondary-outline" size="sm" onClick={() => updateResponse(currentQuestion.moduleQuestionId, {})}>
              Clear Response
            </Button>
            <Button variant="secondary-outline" size="sm" onClick={toggleMarkForReview} className="gap-1.5">
              <Flag className="h-4 w-4" />
              {currentQuestion.state === "MARKED_FOR_REVIEW" || currentQuestion.state === "ANSWERED_MARKED" ? "Unmark" : "Mark for Review"}
            </Button>
            <Button
              variant="primary-black"
              size="sm"
              className="ml-auto gap-1.5"
              onClick={() =>
                questionIndex < currentModule.questions.length - 1
                  ? setQuestionIndex(questionIndex + 1)
                  : moduleIndex < data.modules.length - 1 && jumpTo(moduleIndex + 1, 0)
              }
              disabled={moduleIndex === data.modules.length - 1 && questionIndex === currentModule.questions.length - 1}
            >
              Save & Next <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="primary-lime" size="sm" onClick={() => setConfirmSubmit(true)}>
              Submit Test
            </Button>
          </div>
        </main>

        <aside className={`w-72 shrink-0 border-l border-border bg-white p-4 ${paletteOpen ? "block" : "hidden"} lg:block`}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            {answeredCount} of {flatQuestions.length} answered
          </p>
          {data.modules.map((m, mi) => (
            <div key={m.id} className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted">{m.name}</p>
              <div className="grid grid-cols-6 gap-2">
                {m.questions.map((q, qi) => (
                  <button
                    key={q.moduleQuestionId}
                    onClick={() => jumpTo(mi, qi)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold ${STATE_COLOR[q.state]} ${
                      mi === moduleIndex && qi === questionIndex ? "ring-2 ring-ink ring-offset-1" : ""
                    }`}
                  >
                    {qi + 1}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>

      {confirmSubmit ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="text-lg font-semibold text-ink">Submit Test?</h2>
            <p className="mt-2 text-sm text-muted">
              You have {flatQuestions.length - answeredCount} unanswered question(s). Once submitted, you cannot change your answers.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setConfirmSubmit(false)}>
                Cancel
              </Button>
              <Button variant="primary-lime" size="sm" onClick={handleSubmit}>
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
