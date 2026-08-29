// Converts plain-text Markdown (as pasted from ChatGPT, a .md file, or any
// writing tool that doesn't put real HTML on the clipboard) into the HTML
// subset the blog editor understands. Only used as a fallback when the
// clipboard has no `text/html` payload — see RichTextEditor's paste handler.
//
// Headings are shifted down one level from their Markdown level (# -> h2,
// ## -> h3, ### and deeper -> h4) because the post title already renders as
// the page's only <h1>; pasted content should never introduce a second one.

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatInline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  out = out.replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, (_m, a, b) => `<strong>${a ?? b}</strong>`);
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)|(?<!_)_([^_\n]+)_(?!_)/g, (_m, a, b) => `<em>${a ?? b}</em>`);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return out;
}

function headingTag(hashes: string): "h2" | "h3" | "h4" {
  const level = hashes.length;
  if (level <= 1) return "h2";
  if (level === 2) return "h3";
  return "h4";
}

const TABLE_SEPARATOR_ROW = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((cell) => cell.trim());
}

export function looksLikeMarkdown(text: string): boolean {
  if (/^#{1,6}\s+\S|^[-*+]\s+\S|^\d+\.\s+\S|\*\*[^*]+\*\*|^>\s+\S/m.test(text)) return true;
  const lines = text.split("\n");
  return lines.some((line, i) => line.includes("|") && TABLE_SEPARATOR_ROW.test(lines[i + 1] ?? ""));
}

export function markdownLiteToHtml(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      html.push(`<${headingTag(heading[1])}>${formatInline(heading[2])}</${headingTag(heading[1])}>`);
      i++;
      continue;
    }

    // GFM pipe table: a row containing "|" immediately followed by a
    // separator row of dashes (the "|---|---|" line under the header).
    if (line.includes("|") && TABLE_SEPARATOR_ROW.test(lines[i + 1] ?? "")) {
      const headerCells = splitTableRow(line);
      i += 2; // header row + separator row
      const bodyRows: string[][] = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        bodyRows.push(splitTableRow(lines[i]));
        i++;
      }
      const thead = `<thead><tr>${headerCells.map((cell) => `<th>${formatInline(cell)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${bodyRows
        .map((row) => `<tr>${row.map((cell) => `<td>${formatInline(cell)}</td>`).join("")}</tr>`)
        .join("")}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      const buf = [quote[1]];
      i++;
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      html.push(`<blockquote><p>${buf.map(formatInline).join("<br />")}</p></blockquote>`);
      continue;
    }

    const bullet = /^[-*+]\s+(.*)$/.exec(line);
    if (bullet) {
      const items = [bullet[1]];
      i++;
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*+]\s+/, ""));
        i++;
      }
      html.push(`<ul>${items.map((item) => `<li>${formatInline(item)}</li>`).join("")}</ul>`);
      continue;
    }

    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (numbered) {
      const items = [numbered[1]];
      i++;
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      html.push(`<ol>${items.map((item) => `<li>${formatInline(item)}</li>`).join("")}</ol>`);
      continue;
    }

    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      html.push(`<pre>${escapeHtml(buf.join("\n"))}</pre>`);
      continue;
    }

    // Paragraph: collect consecutive plain lines until a blank line or a
    // line that starts a different block type (including an un-blank-line-
    // separated table header, spotted the same way the top-level check does).
    const buf = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|>\s?|[-*+]\s|\d+\.\s|```)/.test(lines[i]) &&
      !(lines[i].includes("|") && TABLE_SEPARATOR_ROW.test(lines[i + 1] ?? ""))
    ) {
      buf.push(lines[i]);
      i++;
    }
    html.push(`<p>${buf.map(formatInline).join(" ")}</p>`);
  }

  return html.join("");
}
