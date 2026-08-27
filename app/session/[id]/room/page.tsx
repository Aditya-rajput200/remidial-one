"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  PhoneOff,
  UserRound,
  Info,
  FileText,
  ClipboardList,
  PlayCircle,
} from "lucide-react";
import { useSession } from "@/lib/auth/SessionProvider";
import { useStudentData } from "@/lib/data/useStudentData";
import { useMentorData } from "@/lib/data/useMentorData";
import { MessageThread } from "@/components/dashboard/MessageThread";
import { Logo } from "@/components/layout/Logo";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Message, Resource } from "@/lib/data/types";
import { cn } from "@/lib/cn";

const typeIcon: Record<Resource["type"], typeof FileText> = {
  video: PlayCircle,
  note: FileText,
  assignment: ClipboardList,
};

type Tab = "chat" | "notes" | "resources";

export default function SessionRoomPage(props: PageProps<"/session/[id]/room">) {
  const { id } = use(props.params);
  const router = useRouter();
  const { session, ready } = useSession();

  const student = useStudentData();
  const mentor = useMentorData();

  const isStudent = session?.role === "student";
  const data = isStudent ? student.data : mentor.data;
  const addMessage = isStudent ? student.addMessage : mentor.addMessage;
  const updateSessionNotes = isStudent ? student.updateSessionNotes : mentor.updateSessionNotes;

  const [tab, setTab] = useState<Tab>("chat");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [notes, setNotes] = useState("");

  const found = data?.sessions.find((s) => s.id === id) ?? null;

  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace("/login");
  }, [ready, session, router]);

  useEffect(() => {
    // Populates the notes textarea once the async-loaded session data arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (found) setNotes(found.notes);
  }, [found]);

  if (!ready || !session || !data) return null;

  const dashboardHref = isStudent ? "/student/sessions" : "/mentor/sessions";

  if (!found) {
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

  const threadMessages = data.messages
    .filter((m) => m.threadId === found.counterpartId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  function handleSend(text: string) {
    const message: Message = {
      id: `m-${Date.now()}`,
      threadId: found!.counterpartId,
      counterpartName: found!.counterpartName,
      senderRole: "self",
      text,
      timestamp: new Date().toISOString(),
    };
    addMessage(message);
  }

  function handleNotesBlur() {
    updateSessionNotes(found!.id, notes);
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
        <Logo dark />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {found.subjectName} with {found.counterpartName}
          </span>
          <Badge tone="outline-dark">Live preview</Badge>
        </div>
      </header>

      <div className="grid flex-1 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>This is a preview of the learning room. Video/audio connection isn&apos;t enabled yet — chat and notes work normally.</span>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="relative flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl bg-white/5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <UserRound className="h-8 w-8 text-white/70" strokeWidth={1.5} aria-hidden />
              </div>
              <span className="text-sm font-medium text-white/80">You {!cameraOn && "(camera off)"}</span>
            </div>
            <div className="relative flex aspect-video flex-col items-center justify-center gap-3 rounded-2xl bg-white/5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <UserRound className="h-8 w-8 text-white/70" strokeWidth={1.5} aria-hidden />
              </div>
              <span className="text-sm font-medium text-white/80">{found.counterpartName}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <button
              type="button"
              onClick={() => setMicOn((v) => !v)}
              aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                micOn ? "bg-white/10 hover:bg-white/20" : "bg-error text-white"
              )}
            >
              {micOn ? <Mic className="h-5 w-5" aria-hidden /> : <MicOff className="h-5 w-5" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => setCameraOn((v) => !v)}
              aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                cameraOn ? "bg-white/10 hover:bg-white/20" : "bg-error text-white"
              )}
            >
              {cameraOn ? <Video className="h-5 w-5" aria-hidden /> : <VideoOff className="h-5 w-5" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={() => setScreenSharing((v) => !v)}
              aria-label="Toggle screen share"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                screenSharing ? "bg-lime text-ink" : "bg-white/10 hover:bg-white/20"
              )}
            >
              <ScreenShare className="h-5 w-5" aria-hidden />
            </button>
            <a
              href={dashboardHref}
              aria-label="Leave session"
              className="flex h-11 items-center gap-2 rounded-full bg-error px-5 text-sm font-semibold text-white hover:brightness-95"
            >
              <PhoneOff className="h-4 w-4" aria-hidden />
              Leave
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-1 rounded-full bg-white/5 p-1">
            {(["chat", "notes", "resources"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors",
                  tab === t ? "bg-white text-ink" : "text-white/60 hover:text-white"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 rounded-2xl bg-white text-ink">
            {tab === "chat" ? (
              <div className="h-full min-h-[360px]">
                <MessageThread counterpartName={found.counterpartName} messages={threadMessages} onSend={handleSend} />
              </div>
            ) : null}

            {tab === "notes" ? (
              <div className="flex h-full min-h-[360px] flex-col gap-3 p-4">
                <h3 className="text-sm font-semibold text-ink">Session notes</h3>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  className="min-h-[260px] flex-1"
                  placeholder="Jot down what you covered, what to revisit next time..."
                />
              </div>
            ) : null}

            {tab === "resources" ? (
              <div className="flex h-full min-h-[360px] flex-col divide-y divide-border overflow-y-auto p-2">
                {data.resources.length > 0 ? (
                  data.resources.map((resource) => {
                    const Icon = typeIcon[resource.type];
                    return (
                      <div key={resource.id} className="flex items-center gap-3 p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime-soft text-ink">
                          <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                        </div>
                        <p className="truncate text-sm font-medium text-ink">{resource.title}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="p-4 text-sm text-muted">No resources shared yet.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
