"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth/SessionProvider";
import { loadStudentData, saveStudentData } from "@/lib/data/store";
import { seedStudentData } from "@/lib/data/seed";
import type { DashboardSession, Message, Resource, StudentData, StudentProfile } from "@/lib/data/types";

// Profile fields are backed by the real database (see app/api/students/me).
// Sessions/messages/resources/progress are still demo data seeded into
// localStorage until bookings/messaging/resources have real models
// (Phases 4-6) — this hook stitches the two together so dashboard UI built
// against StudentData keeps working unchanged.
async function fetchProfile(): Promise<StudentProfile | null> {
  const response = await fetch("/api/students/me");
  if (!response.ok) return null;
  const body = await response.json();
  return body.profile as StudentProfile;
}

export function useStudentData() {
  const { session } = useSession();
  const [data, setData] = useState<StudentData | null>(null);

  useEffect(() => {
    if (!session || session.role !== "student") return;
    let cancelled = false;

    (async () => {
      const existing = loadStudentData();
      const base = existing ?? seedStudentData(session);
      const profile = await fetchProfile();
      if (cancelled) return;

      const merged: StudentData = profile ? { ...base, profile } : base;
      if (!existing) saveStudentData(merged);
      setData(merged);
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const update = useCallback((updater: (prev: StudentData) => StudentData) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveStudentData(next);
      return next;
    });
  }, []);

  const addSession = useCallback(
    (newSession: DashboardSession) => {
      update((prev) => ({ ...prev, sessions: [newSession, ...prev.sessions] }));
    },
    [update]
  );

  const updateSessionStatus = useCallback(
    (id: string, status: DashboardSession["status"]) => {
      update((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) => (s.id === id ? { ...s, status } : s)),
      }));
    },
    [update]
  );

  const rescheduleSession = useCallback(
    (id: string, date: string) => {
      update((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) => (s.id === id ? { ...s, date, status: "upcoming" } : s)),
      }));
    },
    [update]
  );

  const updateSessionNotes = useCallback(
    (id: string, notes: string) => {
      update((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) => (s.id === id ? { ...s, notes } : s)),
      }));
    },
    [update]
  );

  const addMessage = useCallback(
    (message: Message) => {
      update((prev) => ({ ...prev, messages: [...prev.messages, message] }));
    },
    [update]
  );

  const updateProfile = useCallback(async (profile: StudentProfile) => {
    const response = await fetch("/api/students/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grade: profile.grade,
        learningGoals: profile.learningGoals,
        preferredTime: profile.preferredTime,
        subjectsOfInterest: profile.subjectsOfInterest,
      }),
    });
    if (!response.ok) return false;
    const body = await response.json();
    update((prev) => ({ ...prev, profile: body.profile }));
    return true;
  }, [update]);

  const addResource = useCallback(
    (resource: Resource) => {
      update((prev) => ({ ...prev, resources: [resource, ...prev.resources] }));
    },
    [update]
  );

  return {
    data,
    addSession,
    updateSessionStatus,
    rescheduleSession,
    updateSessionNotes,
    addMessage,
    updateProfile,
    addResource,
  };
}
