"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { UsersRound } from "lucide-react";

type BookingDto = { studentId: string; studentName: string };

export function AssignStudentsPanel({
  assessmentId,
  assigned,
  onClose,
  onChange,
}: {
  assessmentId: string;
  assigned: string[];
  onClose: () => void;
  onChange: () => Promise<void> | void;
}) {
  const [students, setStudents] = useState<{ id: string; name: string }[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set(assigned));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/bookings");
      if (cancelled || !res.ok) return;
      const body = await res.json();
      const unique = new Map<string, string>();
      for (const b of body.bookings as BookingDto[]) unique.set(b.studentId, b.studentName);
      setStudents([...unique.entries()].map(([id, name]) => ({ id, name })));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    const toAssign = [...selected].filter((id) => !assigned.includes(id));
    const toUnassign = assigned.filter((id) => !selected.has(id));
    if (toAssign.length > 0) {
      await fetch(`/api/assessments/${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", studentIds: toAssign }),
      });
    }
    if (toUnassign.length > 0) {
      await fetch(`/api/assessments/${assessmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unassign", studentIds: toUnassign }),
      });
    }
    setSaving(false);
    await onChange();
    onClose();
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">Assign Students</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {students === null ? (
        <p className="text-sm text-muted">Loading your students…</p>
      ) : students.length === 0 ? (
        <EmptyState icon={UsersRound} title="No students yet" description="You'll be able to assign a test once you've had a session with at least one student." />
      ) : (
        <div className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border">
          {students.map((s) => (
            <label key={s.id} className="flex items-center gap-3 p-3 text-sm text-ink">
              <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 rounded border-border" />
              {s.name}
            </label>
          ))}
        </div>
      )}

      <Button variant="primary-lime" className="w-fit" onClick={handleSave} disabled={saving || students === null}>
        {saving ? "Saving…" : "Save Assignment"}
      </Button>
    </Card>
  );
}
