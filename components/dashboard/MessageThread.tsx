"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import type { Message } from "@/lib/data/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export function MessageThread({
  counterpartName,
  messages,
  onSend,
}: {
  counterpartName: string;
  messages: Message[];
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-white">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold text-ink">{counterpartName}</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => {
          const isSelf = message.senderRole === "self";
          return (
            <div key={message.id} className={cn("flex", isSelf ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isSelf ? "bg-ink text-white" : "bg-surface text-ink"
                )}
              >
                <p>{message.text}</p>
                <p className={cn("mt-1 text-[10px]", isSelf ? "text-white/50" : "text-muted-2")}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Say hello to start the conversation.</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message..."
          className="h-11 flex-1 rounded-full border border-border bg-white px-4 text-sm text-ink placeholder:text-muted-2 focus:border-ink/40 focus:outline-none"
        />
        <Button type="submit" size="sm" variant="primary-lime" className="!px-3.5">
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
