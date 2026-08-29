"use client";

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders plain text with inline ($...$) and block ($$...$$) LaTeX segments
 * via KaTeX (spec §6/§10 equation rendering) — question text and
 * explanations can freely mix prose and math without special authoring UI.
 */
export function MathText({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => renderMixedContent(text), [text]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderMixedContent(text: string): string {
  const segments = text.split(/(\${1,2}[^$]+\${1,2})/g);
  return segments
    .map((segment) => {
      const blockMatch = segment.match(/^\$\$([^$]+)\$\$$/);
      const inlineMatch = segment.match(/^\$([^$]+)\$$/);
      try {
        if (blockMatch) return katex.renderToString(blockMatch[1], { throwOnError: false, displayMode: true });
        if (inlineMatch) return katex.renderToString(inlineMatch[1], { throwOnError: false });
      } catch {
        return escapeHtml(segment);
      }
      return escapeHtml(segment);
    })
    .join("");
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
}
