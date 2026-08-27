"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth/SessionProvider";
import { loadMentorData, saveMentorData } from "@/lib/data/store";
import { seedMentorData } from "@/lib/data/seed";
import type {
  AvailabilitySlot,
  DashboardSession,
  MentorData,
  MentorProfile,
  Message,
  Resource,
} from "@/lib/data/types";

// Profile fields are backed by the real database (see app/api/mentors/me).
// Sessions/messages/resources/availability are still demo data seeded into
// localStorage until bookings/messaging/resources have real models
// (Phases 4-6) — this hook stitches the two together so dashboard UI built
// against MentorData keeps working unchanged.
async function fetchProfile(): Promise<MentorProfile | null> {
  const response = await fetch("/api/mentors/me");
  if (!response.ok) return null;
  const body = await response.json();
  return { ...body.profile, languages: (body.profile.languages as string[]).join(", ") };
}

export function useMentorData() {
  const { session } = useSession();
  const [data, setData] = useState<MentorData | null>(null);

  useEffect(() => {
    if (!session || session.role !== "mentor") return;
    let cancelled = false;

    (async () => {
      const existing = loadMentorData();
      const base = existing ?? seedMentorData(session);
      const profile = await fetchProfile();
      if (cancelled) return;

      const merged: MentorData = profile ? { ...base, profile } : base;
      if (!existing) saveMentorData(merged);
      setData(merged);
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const update = useCallback((updater: (prev: MentorData) => MentorData) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveMentorData(next);
      return next;
    });
  }, []);

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

  const updateProfile = useCallback(async (profile: MentorProfile) => {
    const response = await fetch("/api/mentors/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: profile.bio,
        qualifications: profile.qualifications,
        teachingStyle: profile.teachingStyle,
        languages: profile.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      }),
    });
    if (!response.ok) return false;
    const body = await response.json();
    update((prev) => ({
      ...prev,
      profile: { ...body.profile, languages: (body.profile.languages as string[]).join(", ") },
    }));
    return true;
  }, [update]);

  const updateAvailability = useCallback(
    (availability: AvailabilitySlot[]) => {
      update((prev) => ({ ...prev, availability }));
    },
    [update]
  );

  const addResource = useCallback(
    (resource: Resource) => {
      update((prev) => ({ ...prev, resources: [resource, ...prev.resources] }));
    },
    [update]
  );

  return {
    data,
    updateSessionStatus,
    rescheduleSession,
    updateSessionNotes,
    addMessage,
    updateProfile,
    updateAvailability,
    addResource,
  };
}
