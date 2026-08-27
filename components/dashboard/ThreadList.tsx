"use client";

import { UserRound } from "lucide-react";
import type { Message } from "@/lib/data/types";
import { cn } from "@/lib/cn";

export type Thread = {
  id: string;
  name: string;
  lastMessage: Message | null;
};

export function ThreadList({
  threads,
  activeThreadId,
  onSelect,
}: {
  threads: Thread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
      {threads.map((thread) => (
        <button
          key={thread.id}
          type="button"
          onClick={() => onSelect(thread.id)}
          className={cn(
            "flex items-center gap-3 p-4 text-left transition-colors duration-150",
            activeThreadId === thread.id ? "bg-surface" : "hover:bg-surface"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-soft text-ink">
            <UserRound className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{thread.name}</p>
            <p className="truncate text-xs text-muted">
              {thread.lastMessage ? thread.lastMessage.text : "No messages yet"}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
