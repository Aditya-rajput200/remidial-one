"use client";

import { useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { playJoinChime, playLeaveChime } from "@/lib/audio/chime";

/** Plays a short chime whenever another participant joins or leaves the room. Renders nothing — must sit inside a <LiveKitRoom>. */
export function SessionSoundCues() {
  const room = useRoomContext();

  useEffect(() => {
    room.on(RoomEvent.ParticipantConnected, playJoinChime);
    room.on(RoomEvent.ParticipantDisconnected, playLeaveChime);
    return () => {
      room.off(RoomEvent.ParticipantConnected, playJoinChime);
      room.off(RoomEvent.ParticipantDisconnected, playLeaveChime);
    };
  }, [room]);

  return null;
}
