"use client";

import "@livekit/components-styles";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import { Info, ShieldCheck } from "lucide-react";
import { useSession } from "@/lib/auth/SessionProvider";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

type BookingSummary = {
  id: string;
  status: string;
  subject: { name: string };
  mentorName: string;
  studentName: string;
};

type TokenResponse = {
  token: string;
  serverUrl: string;
  isModerator: boolean;
};

export default function SessionRoomPage(props: PageProps<"/session/[id]/room">) {
  const { id } = use(props.params);
  const router = useRouter();
  const { session, ready } = useSession();

  const [booking, setBooking] = useState<BookingSummary | null | undefined>(undefined);
  const [videoAuth, setVideoAuth] = useState<TokenResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/login");
  }, [ready, session, router]);

  useEffect(() => {
    if (!ready || !session) return;
    let cancelled = false;

    (async () => {
      const bookingRes = await fetch(`/api/bookings/${id}`);
      if (!bookingRes.ok) {
        if (!cancelled) setBooking(null);
        return;
      }
      const bookingBody = await bookingRes.json();
      if (cancelled) return;
      setBooking(bookingBody.booking);

      const tokenRes = await fetch(`/api/bookings/${id}/video-token`, { method: "POST" });
      const tokenBody = await tokenRes.json().catch(() => ({}));
      if (cancelled) return;
      if (!tokenRes.ok) {
        setError(tokenBody?.error ?? "Could not connect to this session.");
        return;
      }
      setVideoAuth(tokenBody);
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, session, id]);

  if (!ready || !session) return null;

  const dashboardHref = session.role === "mentor" ? "/mentor/sessions" : "/student/sessions";

  if (booking === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface p-6">
        <EmptyState
          icon={Info}
          title="Session not found"
          description="This session may have been cancelled or doesn't exist."
          action={
            <a href={dashboardHref} className="text-sm font-semibold text-ink underline underline-offset-4">
              Back to sessions
            </a>
          }
        />
      </div>
    );
  }

  const counterpartName = session.role === "mentor" ? booking?.studentName : booking?.mentorName;

  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <Logo dark />
        {booking ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {booking.subject.name} with {counterpartName}
            </span>
            {videoAuth?.isModerator ? (
              <Badge tone="outline-dark" className="gap-1">
                <ShieldCheck className="h-3 w-3" aria-hidden />
                Observing
              </Badge>
            ) : null}
          </div>
        ) : null}
        <a href={dashboardHref} className="text-sm font-medium text-white/70 hover:text-white">
          Leave
        </a>
      </header>

      <div className="flex-1">
        {error ? (
          <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          </div>
        ) : videoAuth ? (
          <LiveKitRoom
            token={videoAuth.token}
            serverUrl={videoAuth.serverUrl}
            audio={!videoAuth.isModerator}
            video={!videoAuth.isModerator}
            connect
            data-lk-theme="default"
            style={{ height: "calc(100vh - 61px)" }}
            onDisconnected={() => router.push(dashboardHref)}
          >
            <VideoConference />
          </LiveKitRoom>
        ) : (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
