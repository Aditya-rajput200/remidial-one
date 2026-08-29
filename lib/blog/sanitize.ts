// Minimal allowlist HTML sanitizer for blog post content. No DOM is
// available where this also needs to run (the API route, server-side), so
// this is a deliberately conservative regex-based walk rather than a
// DOMPurify-style parser — it strips anything not explicitly allowed rather
// than trying to fix up disallowed content. Used both server-side (before
// persisting BlogPost.content) and client-side (editor live preview) as
// defense in depth: only cms.update-permission holders can reach the write
// path at all, but content is still rendered via dangerouslySetInnerHTML on
// public pages, so untrusted markup must never survive a save.

const ALLOWED_TAGS = new Set([
  "p", "br", "div", "span",
  "b", "strong", "i", "em", "u", "s",
  "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote", "a", "img", "code", "pre",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
]);

// The post title is already rendered as the page's only <h1>, and the editor
// only styles h2–h4 (see .prose-blog in globals.css) — so rather than
// silently dropping out-of-range headings pasted from ChatGPT, Word, or a
// Markdown file (which would strip the tag but leave its text as an
// unstyled run merged into the surrounding paragraph), fold them onto the
// nearest supported level.
const TAG_REMAP: Record<string, string> = { h1: "h2", h5: "h4", h6: "h4" };

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  th: new Set(["colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
};

const SAFE_URL_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

function isSafeUrl(raw: string, allowData: boolean): boolean {
  const value = raw.trim();
  if (value.startsWith("#") || value.startsWith("/")) return true;
  if (allowData && /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/i.test(value)) return true;
  try {
    // Relative URLs without a scheme resolve fine against this dummy base;
    // absolute URLs keep their own scheme for the check below.
    const url = new URL(value, "https://example.com");
    return SAFE_URL_PROTOCOLS.includes(url.protocol);
  } catch {
    return false;
  }
}

function sanitizeAttrs(tag: string, attrString: string): string {
  const allowed = ALLOWED_ATTRS[tag];
  if (!allowed || !attrString.trim()) return "";

  const attrPattern = /([a-zA-Z-]+)\s*=\s*"([^"]*)"|([a-zA-Z-]+)\s*=\s*'([^']*)'/g;
  const kept: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(attrString))) {
    const name = (match[1] ?? match[3]).toLowerCase();
    const value = match[2] ?? match[4] ?? "";
    if (!allowed.has(name)) continue;
    if ((name === "href" || name === "src") && !isSafeUrl(value, name === "src")) continue;
    if (name === "target" && value !== "_blank") continue;
    const safeValue = value.replace(/"/g, "&quot;");
    kept.push(name === "target" ? 'target="_blank" rel="noopener noreferrer"' : `${name}="${safeValue}"`);
  }

  return kept.length ? ` ${kept.join(" ")}` : "";
}

export function sanitizeBlogHtml(html: string): string {
  if (!html) return "";

  let out = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  out = out.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (full, closing: string, rawTag: string, attrs: string) => {
    const tag = TAG_REMAP[rawTag.toLowerCase()] ?? rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return `</${tag}>`;
    const selfClosing = /\/\s*$/.test(attrs) || tag === "br";
    const safeAttrs = sanitizeAttrs(tag, attrs.replace(/\/\s*$/, ""));
    return `<${tag}${safeAttrs}${selfClosing ? " />" : ">"}`;
  });

  return out.trim();
}
