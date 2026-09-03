"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=15");
      if (!res.ok) return;
      const body = await res.json();
      setItems(body.notifications ?? []);
      setUnread(body.unreadCount ?? 0);
    } catch {
      /* best-effort */
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    load();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-white shadow-lift">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="text-sm font-semibold text-ink">Notifications</span>
            {unread > 0 ? (
              <button type="button" onClick={markAllRead} className="text-xs font-medium text-lime-ink hover:underline">
                Mark all read
              </button>
            ) : null}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-muted">Nothing new right now.</li>
            ) : (
              items.map((n) => {
                const inner = (
                  <div className={cn("px-4 py-3", !n.readAt && "bg-lime-soft/40")}>
                    <p className="text-sm font-medium text-ink">{n.title}</p>
                    {n.body ? <p className="mt-0.5 text-xs text-muted">{n.body}</p> : null}
                    <p className="mt-1 text-[11px] text-muted-2">
                      {new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                );
                return (
                  <li key={n.id} className="border-b border-border last:border-0">
                    {n.linkUrl ? (
                      <Link href={n.linkUrl} onClick={() => setOpen(false)} className="block hover:bg-surface">
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
