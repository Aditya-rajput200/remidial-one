import type { DashboardSession, SessionStatus } from "@/lib/data/types";

export type BookingDto = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  gradeLabel: string | null;
  studentNotes: string | null;
  mentorRating: number | null;
  mentorRatingNote: string | null;
  actualStartedAt: string | null;
  actualEndedAt: string | null;
  subject: { slug: string; name: string };
  mentorId: string;
  mentorName: string;
  studentId: string;
  studentName: string;
};

function toSessionStatus(status: BookingDto["status"]): SessionStatus {
  if (status === "COMPLETED") return "completed";
  if (status === "CANCELLED" || status === "NO_SHOW") return "cancelled";
  return "upcoming";
}

/** Adapts a real Booking into the DashboardSession shape SessionCard/SessionTabs expect. */
export function bookingToSession(booking: BookingDto, viewer: "student" | "mentor"): DashboardSession {
  const isStudentViewer = viewer === "student";
  return {
    id: booking.id,
    counterpartId: isStudentViewer ? booking.mentorId : booking.studentId,
    counterpartName: isStudentViewer ? booking.mentorName : booking.studentName,
    subjectSlug: booking.subject.slug,
    subjectName: booking.subject.name,
    classBandName: booking.gradeLabel ?? "",
    date: booking.scheduledAt,
    durationMinutes: booking.durationMinutes,
    status: toSessionStatus(booking.status),
    notes: booking.studentNotes ?? "",
    mentorRating: booking.mentorRating,
    mentorRatingNote: booking.mentorRatingNote,
    actualStartedAt: booking.actualStartedAt,
    actualEndedAt: booking.actualEndedAt,
  };
}

export async function fetchBookings(): Promise<BookingDto[]> {
  const response = await fetch("/api/bookings");
  if (!response.ok) return [];
  const body = await response.json();
  return body.bookings as BookingDto[];
}

export async function cancelBooking(id: string, reason?: string): Promise<boolean> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "cancel", reason }),
  });
  return response.ok;
}

export async function rescheduleBooking(id: string, scheduledAt: string): Promise<boolean> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reschedule", scheduledAt }),
  });
  return response.ok;
}

export async function completeBooking(id: string): Promise<boolean> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "complete" }),
  });
  return response.ok;
}

export async function updateBookingNotes(id: string, notes: string): Promise<boolean> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "notes", notes }),
  });
  return response.ok;
}

export async function rateBooking(id: string, rating: number, note?: string): Promise<boolean> {
  const response = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "rate", rating, note }),
  });
  return response.ok;
}
