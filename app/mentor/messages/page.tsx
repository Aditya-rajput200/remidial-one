"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useMentorData } from "@/lib/data/useMentorData";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ThreadList, type Thread } from "@/components/dashboard/ThreadList";
import { MessageThread } from "@/components/dashboard/MessageThread";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEMO_STUDENT } from "@/lib/data/types";
import type { Message } from "@/lib/data/types";
import { SkeletonThreads } from "@/components/dashboard/DashboardSkeletons";

export default function MentorMessagesPage() {
  const { data, addMessage } = useMentorData();
  const [activeThreadId, setActiveThreadId] = useState<string>(DEMO_STUDENT.id);

  if (!data) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Messages" description="Conversations with your students." />
        <SkeletonThreads />
      </div>
    );
  }

  const threadMessages = data.messages
    .filter((m) => m.threadId === activeThreadId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  const threads: Thread[] = data.sessions.length > 0
    ? [
        {
          id: DEMO_STUDENT.id,
          name: DEMO_STUDENT.name,
          lastMessage: threadMessages[threadMessages.length - 1] ?? null,
        },
      ]
    : [];

  function handleSend(text: string) {
    const message: Message = {
      id: `m-${Date.now()}`,
      threadId: activeThreadId,
      counterpartName: DEMO_STUDENT.name,
      senderRole: "self",
      text,
      timestamp: new Date().toISOString(),
    };
    addMessage(message);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Messages" description="Conversations with your students." />

      {threads.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]" style={{ minHeight: "480px" }}>
          <ThreadList threads={threads} activeThreadId={activeThreadId} onSelect={setActiveThreadId} />
          <MessageThread counterpartName={DEMO_STUDENT.name} messages={threadMessages} onSend={handleSend} />
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Once a student books a session with you, you can message them here."
        />
      )}
    </div>
  );
}
