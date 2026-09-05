"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 60;
const DELETE_MS = 32;
const HOLD_MS = 1800;
const GAP_MS = 350;

/**
 * Types and deletes each word in `words` on a loop, one character at a time,
 * with a blinking caret. Starts already showing the first word in full (no
 * empty-text flash on first paint, and it's a complete, sensible headline on
 * its own) and only starts cycling after `HOLD_MS`. Respects
 * prefers-reduced-motion by never advancing past that first word — the caret
 * still renders, but its blink is neutralised by the global reduced-motion
 * reset in globals.css, same as every other animation on this page.
 */
export function TypewriterText({
  words,
  className,
}: {
  words: readonly string[];
  className?: string;
}) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charCount, setCharCount] = useState(words[0]?.length ?? 0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const word = words[wordIndex % words.length] ?? "";

    if (!deleting && charCount === word.length) {
      const id = setTimeout(() => setDeleting(true), HOLD_MS);
      return () => clearTimeout(id);
    }

    if (deleting && charCount === 0) {
      const id = setTimeout(() => {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }, GAP_MS);
      return () => clearTimeout(id);
    }

    const id = setTimeout(
      () => setCharCount((c) => c + (deleting ? -1 : 1)),
      deleting ? DELETE_MS : TYPE_MS
    );
    return () => clearTimeout(id);
  }, [charCount, deleting, wordIndex, words]);

  const word = words[wordIndex % words.length] ?? "";
  const shown = word.slice(0, charCount);

  return (
    <span className={className}>
      {shown}
      {words.length > 1 ? (
        <span
          className="ml-0.5 inline-block h-[0.85em] w-[2px] translate-y-[0.05em] animate-pulse bg-current align-middle"
          aria-hidden
        />
      ) : null}
    </span>
  );
}
