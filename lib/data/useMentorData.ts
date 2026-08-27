"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth/SessionProvider";
import { loadMentorData, saveMentorData } from "@/lib/data/store";
import { seedMentorData } from "@/lib/data/seed";
import {
  bookingToSession,
  cancelBooking,
  completeBooking,
  fetchBookings,
  rescheduleBooking,
  updateBookingNotes,
} from "@/lib/data/bookingAdapter";
import type { AvailabilitySlot, MentorData, MentorProfile, Message, Resource } from "@/lib/data/types";

const DAY_NAMES: AvailabilitySlot["day"][] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Profile, availability, and sessions are backed by the real database (see
// app/api/mentors/me, app/api/mentors/me/availability, app/api/bookings).
// Messages/resources are still demo data seeded into localStorage until they
// have real models (Phase 6) — this hook stitches the two together so
// dashboard UI built against MentorData keeps working unchanged.
async function fetchProfile(): Promise<MentorProfile | null> {
  const response = await fetch("/api/mentors/me");
  if (!response.ok) return null;
  const body = await response.json();
  return { ...body.profile, languages: (body.profile.languages as string[]).join(", ") };
}

async function fetchAvailability(): Promise<AvailabilitySlot[]> {
  const response = await fetch("/api/mentors/me/availability");
  if (!response.ok) return [];
  const body = await response.json();
  return (body.slots as { dayOfWeek: number; startHour: number; endHour: number }[]).map((s) => ({
    day: DAY_NAMES[s.dayOfWeek],
    startHour: s.startHour,
    endHour: s.endHour,
  }));
}

export function useMentorData() {
  const { session } = useSession();
  const [data, setData] = useState<MentorData | null>(null);

  const refetchSessions = useCallback(async () => {
    const bookings = await fetchBookings();
    const sessions = bookings.map((b) => bookingToSession(b, "mentor"));
    setData((prev) => (prev ? { ...prev, sessions } : prev));
  }, []);

  useEffect(() => {
    if (!session || session.role !== "mentor") return;
    let cancelled = false;

    (async () => {
      const base = loadMentorData() ?? seedMentorData(session);
      const [profile, availability, bookings] = await Promise.all([
        fetchProfile(),
        fetchAvailability(),
        fetchBookings(),
      ]);
      if (cancelled) return;

      const merged: MentorData = {
        ...base,
        ...(profile ? { profile } : {}),
        availability,
        sessions: bookings.map((b) => bookingToSession(b, "mentor")),
      };
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
    async (id: string, status: "cancelled" | "completed") => {
      const ok = status === "cancelled" ? await cancelBooking(id) : await completeBooking(id);
      if (ok) await refetchSessions();
      return ok;
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

  const updateProfile = useCallback(async (profile: MentorProfile) => {
    const response = await fetch("/api/mentors/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: profile.bio,
        qualifications: profile.qualifications,
        teachingStyle: profile.teachingStyle,
        subjectSlugs: profile.subjects.map((s) => s.slug),
        gradeSlugs: profile.grades.map((g) => g.slug),
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

  const updateAvailability = useCallback(async (availability: AvailabilitySlot[]) => {
    const response = await fetch("/api/mentors/me/availability", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slots: availability.map((slot) => ({
          dayOfWeek: DAY_NAMES.indexOf(slot.day),
          startHour: slot.startHour,
          endHour: slot.endHour,
        })),
      }),
    });
    if (!response.ok) return false;
    update((prev) => ({ ...prev, availability }));
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
    updateAvailability,
    addResource,
  };
}
