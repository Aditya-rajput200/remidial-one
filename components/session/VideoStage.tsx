"use client";

import {
  ControlBar,
  GridLayout,
  VideoTrack,
  isTrackReference,
  useIsSpeaking,
  useMaybeTrackRefContext,
  useTracks,
} from "@livekit/components-react";
import type { TrackReference, TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { Track, type Participant } from "livekit-client";
import { MicOff } from "lucide-react";
import clsx from "clsx";
import { Avatar } from "@/components/ui/Avatar";

function getAvatarUrl(participant: Participant): string | undefined {
  if (!participant.metadata) return undefined;
  try {
    const parsed = JSON.parse(participant.metadata) as { avatarUrl?: string };
    return parsed.avatarUrl || undefined;
  } catch {
    return undefined;
  }
}

type TileProps = { trackRef?: TrackReferenceOrPlaceholder; compact?: boolean };

/**
 * GridLayout (components-react v2) hands each cloned child its track via
 * `TrackRefContext`, not as an injected `trackRef` prop (that was the v1
 * cloneElement convention) — reading only the prop left this tile always
 * bailing out on `!trackRef`, rendering nothing while GridLayout's own
 * wrapper still occupied space, i.e. a solid black grid with no visible
 * tiles. Fall back to the context so this still works standalone (`trackRef`
 * passed explicitly) or nested under GridLayout.
 * `useIsMuted` has no internal guard for an undefined trackRef and throws, so
 * mic-mute state is read directly off the participant instead of via that
 * hook. `useIsSpeaking` is safe here since it explicitly accepts `undefined`.
 */
function ParticipantTileWithAvatar({ trackRef: trackRefProp, compact }: TileProps) {
  const contextTrackRef = useMaybeTrackRefContext();
  const trackRef = trackRefProp ?? contextTrackRef;
  const isSpeaking = useIsSpeaking(trackRef?.participant);
  if (!trackRef) return null;

  const { participant } = trackRef;
  const hasVideo = Boolean(trackRef.publication);
  const avatarUrl = getAvatarUrl(participant);
  const displayName = participant.name || participant.identity;
  const isMuted = !participant.isMicrophoneEnabled;

  return (
    <div
      className={clsx(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-800",
        isSpeaking && "ring-2 ring-[#C4EE40]",
      )}
    >
      {hasVideo ? (
        <VideoTrack trackRef={trackRef as TrackReference} className="h-full w-full object-cover" />
      ) : (
        <Avatar src={avatarUrl} alt={displayName} size={compact ? "sm" : "lg"} />
      )}
      {!compact && (
        <div className="absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
          {isMuted ? <MicOff className="h-3 w-3 shrink-0" aria-hidden /> : null}
          <span className="truncate">{displayName}</span>
        </div>
      )}
    </div>
  );
}

type Props = { compact?: boolean };

/** Identifies a track for React keys — participant + source is unique across
 * the two sources this component queries, without pulling in
 * `@livekit/components-core` (a transitive, not direct, dependency) just for
 * its `getTrackReferenceId` helper. */
function trackKey(trackRef: TrackReferenceOrPlaceholder): string {
  return `${trackRef.participant.identity}:${trackRef.source}`;
}

/**
 * Replaces LiveKit's all-in-one <VideoConference> with a custom grid so a
 * camera-off participant shows their profile picture instead of a blank
 * tile — VideoConference has no prop for that, so this drops to GridLayout
 * + a custom tile instead. `compact` renders a smaller, chrome-free version
 * for use as the floating PiP while the whiteboard is active (see
 * app/session/[id]/room/page.tsx) — full mode is the default main view.
 */
export function VideoStage({ compact = false }: Props) {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  // A live screen share takes over the main view; everyone's camera
  // (including the sharer's own) drops to small stacked corner tiles. Only
  // a real (non-placeholder) screen-share track counts — camera placeholders
  // use the same track-shape but obviously shouldn't trigger spotlight mode.
  const screenShareTrack = tracks.find(
    (t): t is TrackReference => isTrackReference(t) && t.publication.source === Track.Source.ScreenShare,
  );
  const cornerTracks = screenShareTrack ? tracks.filter((t) => t !== screenShareTrack) : [];

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-ink">
      {screenShareTrack ? (
        // No padding, no rounded corners here (unlike the grid case below) —
        // the shared screen fills the container edge to edge. object-cover
        // (not -contain): the call chrome above/below the video means this
        // container's aspect ratio essentially never matches a shared
        // screen's own, so -contain always left black bars down the sides —
        // cropping the edges reads as "full screen" far better than that.
        <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
          <VideoTrack trackRef={screenShareTrack} className="h-full w-full object-cover" />
          {cornerTracks.length > 0 && (
            <div
              className={clsx(
                "pointer-events-none absolute flex flex-col",
                compact ? "bottom-1.5 right-1.5 -space-y-4" : "bottom-4 right-4 -space-y-6",
              )}
            >
              {cornerTracks.map((t) => (
                <div
                  key={trackKey(t)}
                  className={clsx(
                    "pointer-events-auto overflow-hidden rounded-full shadow-lg ring-2 ring-ink",
                    compact ? "h-8 w-8" : "h-11 w-11",
                  )}
                >
                  {/* Always compact here regardless of the outer prop — these
                      corner bubbles are small by design, not just while the
                      whole stage is in PiP mode. */}
                  <ParticipantTileWithAvatar trackRef={t} compact />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col p-2">
          <GridLayout tracks={tracks} className="flex-1">
            <ParticipantTileWithAvatar compact={compact} />
          </GridLayout>
        </div>
      )}
      {!compact && (
        <div className="border-t border-white/10 bg-ink/95 px-2 py-1.5">
          <ControlBar
            variation="minimal"
            controls={{ microphone: true, camera: true, screenShare: true, leave: false, chat: false, settings: false }}
          />
        </div>
      )}
    </div>
  );
}
