"use client";

import "@livekit/components-styles";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { Info, PencilRuler, ShieldCheck, X } from "lucide-react";
import clsx from "clsx";
import { useSession } from "@/lib/auth/SessionProvider";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SessionSoundCues } from "@/components/session/SessionSoundCues";
import { VideoStage } from "@/components/session/VideoStage";
import { useWhiteboardStore } from "@/components/whiteboard/state/whiteboardStore";

// Konva touches the DOM at import time — never render it during SSR.
const WhiteboardPanel = dynamic(
  () => import("@/components/whiteboard/WhiteboardPanel").then((m) => m.WhiteboardPanel),
  { ssr: false },
);

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

// Fire-and-forget: a missed attendance beat shouldn't block leaving the
// room, and there's nothing useful to show the user if it fails.
function recordAttendance(bookingId: string, action: "join" | "leave") {
  fetch(`/api/bookings/${bookingId}/attendance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
    keepalive: true,
  }).catch(() => {});
}

export default function SessionRoomPage(props: PageProps<"/session/[id]/room">) {
  const { id } = use(props.params);
  const router = useRouter();
  const { session, ready } = useSession();

  const [booking, setBooking] = useState<BookingSummary | null | undefined>(undefined);
  const [videoAuth, setVideoAuth] = useState<TokenResponse | null>(null);
  const [error, setError] = useState("");
  const [boardActive, setBoardActive] = useState(false);
  // The whiteboard socket stays connected (and this store updates) even
  // while boardActive is false and WhiteboardPanel is display:none — so a
  // presenter starting up is visible here regardless of whether this client
  // currently has the board open.
  const presenterId = useWhiteboardStore((s) => s.presenterId);
  // Lighter-touch than the presenter auto-open above: just opening the
  // board (no "Present" toggle) only nudges the other participant with a
  // dismissible banner rather than forcing their screen over too.
  const peerBoardOpenEvent = useWhiteboardStore((s) => s.peerBoardOpenEvent);
  const dismissPeerBoardOpen = useWhiteboardStore((s) => s.dismissPeerBoardOpen);
  // Derived at render time, not synced via an effect: while anyone is
  // presenting, the board is forced full-screen for everyone — a manual
  // "back to video" click can't fight it (the toggle button disables
  // itself below) — and the moment presenting stops, each client reverts
  // to whatever its own `boardActive` toggle was already set to.
  const isBoardActive = boardActive || Boolean(presenterId);

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/login");
  }, [ready, session, router]);

  // The banner's own visibility already gates on `!isBoardActive`, but the
  // underlying event needs clearing too — otherwise closing the board again
  // later (with no NEW peer-open in between) would resurface a stale banner
  // for an open that already happened.
  useEffect(() => {
    if (isBoardActive) dismissPeerBoardOpen();
  }, [isBoardActive, dismissPeerBoardOpen]);

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
    // h-screen + overflow-hidden, not min-h-screen: a "min" height lets the
    // document grow taller than the viewport (and the browser add its own
    // scrollbar) if anything inside is even a pixel off — a hard cap means
    // the room can never scroll, only its own internal flex children resize.
    <div className="flex h-screen flex-col overflow-hidden bg-ink text-white">
      <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
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
        <div className="flex items-center gap-3">
          {booking && !error ? (
            <button
              type="button"
              onClick={() => setBoardActive((active) => !active)}
              disabled={Boolean(presenterId)}
              title={presenterId ? "Someone is presenting — you'll return to video once they stop" : undefined}
              aria-pressed={isBoardActive}
              className={clsx(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                isBoardActive ? "bg-[#C4EE40] text-black" : "bg-white/10 text-white/70 hover:text-white",
              )}
            >
              <PencilRuler className="h-3.5 w-3.5" aria-hidden />
              Whiteboard
            </button>
          ) : null}
          <a href={dashboardHref} className="text-sm font-medium text-white/70 hover:text-white">
            Leave
          </a>
        </div>
      </header>

      {/* No hardcoded header-height offset: the parent is a hard h-screen
          and the header is shrink-0, so flex-1 alone fills whatever space
          actually remains — a magic-number calc() here would silently drift
          the moment the header's real height changed. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {error ? (
          <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          </div>
        ) : videoAuth ? (
          <>
            {/* LiveKitRoom stays mounted at all times regardless of layout —
                only its wrapping container's size/position changes below,
                so starting the whiteboard never drops the call.
                This wrapper is a flex column, not a plain h-full/w-full
                block: a percentage height on a block child of a flex item
                that's also position:relative doesn't reliably resolve in
                Chromium (confirmed empirically — even an !important inline
                height:100% override had no effect), so sizing goes through
                flex-grow instead. */}
            <div
              className={
                isBoardActive
                  ? "absolute bottom-4 right-4 z-30 h-40 w-56 cursor-pointer overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 transition-all"
                  : "flex min-h-0 flex-1 flex-col"
              }
              onClick={isBoardActive && !presenterId ? () => setBoardActive(false) : undefined}
              role={isBoardActive ? "button" : undefined}
              aria-label={isBoardActive ? "Show full video" : undefined}
            >
              <LiveKitRoom
                token={videoAuth.token}
                serverUrl={videoAuth.serverUrl}
                audio={!videoAuth.isModerator}
                video={!videoAuth.isModerator}
                connect
                data-lk-theme="default"
                style={{ display: "flex", flexDirection: "column", flex: "1 1 0%", minHeight: 0 }}
                onConnected={() => recordAttendance(id, "join")}
                onDisconnected={() => {
                  recordAttendance(id, "leave");
                  router.push(dashboardHref);
                }}
              >
                <VideoStage compact={isBoardActive} />
                <RoomAudioRenderer />
                <SessionSoundCues />
              </LiveKitRoom>
            </div>

            <div className={isBoardActive ? "flex min-h-0 flex-1 flex-col" : "hidden"}>
              <WhiteboardPanel bookingId={id} active={isBoardActive} />
            </div>

            {!isBoardActive && peerBoardOpenEvent && (
              <div className="pointer-events-none absolute inset-x-0 top-4 z-40 flex justify-center">
                <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-[#C4EE40] py-2 pl-4 pr-2 text-sm font-medium text-black shadow-lg">
                  <PencilRuler className="h-4 w-4 shrink-0" aria-hidden />
                  {peerBoardOpenEvent.isMentor ? "Your mentor" : "Your student"} opened the whiteboard
                  <button
                    type="button"
                    onClick={() => {
                      setBoardActive(true);
                      dismissPeerBoardOpen();
                    }}
                    className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white hover:bg-black/80"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={dismissPeerBoardOpen}
                    aria-label="Dismiss"
                    className="rounded-full p-1 text-black/60 hover:bg-black/10 hover:text-black"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
