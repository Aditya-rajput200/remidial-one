"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth/SessionProvider";
import { loadStudentData, saveStudentData } from "@/lib/data/store";
import { seedStudentData } from "@/lib/data/seed";
import { bookingToSession, cancelBooking, fetchBookings, rescheduleBooking, updateBookingNotes } from "@/lib/data/bookingAdapter";
import type { Message, Resource, StudentData, StudentProfile } from "@/lib/data/types";

// Profile and sessions are backed by the real database (see app/api/students/me
// and app/api/bookings). Messages/resources/progress are still demo data
// seeded into localStorage until they have real models (Phases 5-6) — this
// hook stitches the two together so dashboard UI built against StudentData
// keeps working unchanged.
async function fetchProfile(): Promise<StudentProfile | null> {
  const response = await fetch("/api/students/me");
  if (!response.ok) return null;
  const body = await response.json();
  return body.profile as StudentProfile;
}

export function useStudentData() {
  const { session } = useSession();
  const [data, setData] = useState<StudentData | null>(null);

  const refetchSessions = useCallback(async () => {
    const bookings = await fetchBookings();
    const sessions = bookings.map((b) => bookingToSession(b, "student"));
    setData((prev) => (prev ? { ...prev, sessions } : prev));
  }, []);

  useEffect(() => {
    if (!session || session.role !== "student") return;
    let cancelled = false;

    (async () => {
      const base = loadStudentData() ?? seedStudentData(session);
      const [profile, bookings] = await Promise.all([fetchProfile(), fetchBookings()]);
      if (cancelled) return;

      const merged: StudentData = {
        ...base,
        ...(profile ? { profile } : {}),
        sessions: bookings.map((b) => bookingToSession(b, "student")),
      };
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

  const updateSessionStatus = useCallback(
    async (id: string, status: "cancelled" | "completed") => {
      if (status === "cancelled") {
        const ok = await cancelBooking(id);
        if (ok) await refetchSessions();
        return ok;
      }
      return false;
    },
    [refetchSessions]
  );

  const rescheduleSession = useCallback(
    async (id: string, date: string) => {
      const ok = await rescheduleBooking(id, date);
      if (ok) await refetchSessions();
      return ok;
    },
    [refetchSessions]
  );

  const updateSessionNotes = useCallback(
    async (id: string, notes: string) => {
      const ok = await updateBookingNotes(id, notes);
      if (ok) update((prev) => ({ ...prev, sessions: prev.sessions.map((s) => (s.id === id ? { ...s, notes } : s)) }));
      return ok;
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
    refetchSessions,
    updateSessionStatus,
    rescheduleSession,
    updateSessionNotes,
    addMessage,
    updateProfile,
    addResource,
  };
}
