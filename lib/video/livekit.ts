import "server-only";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set. See .env.example.`);
  return value;
}

export function roomNameForBooking(bookingId: string): string {
  return `booking-${bookingId}`;
}

type ParticipantGrant = {
  roomName: string;
  identity: string;
  name: string;
  /** Moderator/observer join (admin with meetings.join_any) vs. a normal participant. */
  asModerator?: boolean;
  /** Surfaced client-side via Participant.metadata — LiveKit has no native
   * avatar concept, so this is how the video tile knows what to show when
   * a participant's camera is off (see components/session/VideoStage.tsx). */
  avatarUrl?: string | null;
};

export async function createParticipantToken({ roomName, identity, name, asModerator, avatarUrl }: ParticipantGrant): Promise<string> {
  const apiKey = requireEnv("LIVEKIT_API_KEY");
  const apiSecret = requireEnv("LIVEKIT_API_SECRET");

  const token = new AccessToken(apiKey, apiSecret, {
    identity,
    name,
    ttl: "4h",
    metadata: avatarUrl ? JSON.stringify({ avatarUrl }) : undefined,
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    roomAdmin: asModerator,
    // Admins/moderators join as observers by default — they can see and
    // moderate but don't publish camera/mic unless explicitly enabled later.
    canPublish: !asModerator,
    canSubscribe: true,
    canPublishData: true,
    hidden: asModerator,
  });

  return token.toJwt();
}

let roomServiceClient: RoomServiceClient | undefined;

export function getRoomServiceClient(): RoomServiceClient {
  if (!roomServiceClient) {
    // RoomServiceClient wants an https:// host; NEXT_PUBLIC_LIVEKIT_URL is
    // the wss:// URL the browser client connects to — same LiveKit project,
    // just a different scheme for server-to-server REST calls.
    const host = requireEnv("NEXT_PUBLIC_LIVEKIT_URL").replace(/^wss:/, "https:").replace(/^ws:/, "http:");
    roomServiceClient = new RoomServiceClient(host, requireEnv("LIVEKIT_API_KEY"), requireEnv("LIVEKIT_API_SECRET"));
  }
  return roomServiceClient;
}
