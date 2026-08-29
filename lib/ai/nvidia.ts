import "server-only";

const NVIDIA_CHAT_COMPLETIONS_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_MODEL = "meta/llama-3.1-8b-instruct";
// A vision-capable NIM model — text-only DEFAULT_MODEL above can't read the
// whiteboard snapshot image generateClassNotes() sends it. Configurable
// since the exact model IDs available on a given NVIDIA account can differ;
// this default hasn't been live-verified yet (see the plan's flagged gap —
// NVIDIA_API_KEY isn't set in this environment).
const DEFAULT_VISION_MODEL = "meta/llama-3.2-11b-vision-instruct";

const SYSTEM_PROMPT =
  "You are a warm, encouraging learning coach writing for a student's progress dashboard. " +
  "Given the student's session-performance stats as JSON, write a short insight: 2-3 sentences, " +
  "plain language, no markdown or lists. Mention one specific strength and one specific area to " +
  "focus on next, grounded only in the numbers given — never invent a subject or score that isn't " +
  "in the data.";

export type NvidiaInsightResult =
  | { ok: true; insight: string }
  | { ok: false; reason: "not_configured" | "request_failed" };

/**
 * Calls NVIDIA's OpenAI-compatible NIM chat completions endpoint
 * (https://build.nvidia.com) to turn a student's stats into a short written
 * insight. Requires NVIDIA_API_KEY — returns `not_configured` when it's
 * missing so the UI can show a clear setup message instead of a generic error.
 */
export async function generateStudentInsight(statsJson: string): Promise<NvidiaInsightResult> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return { ok: false, reason: "not_configured" };

  try {
    const response = await fetch(NVIDIA_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model: process.env.NVIDIA_MODEL || DEFAULT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: statsJson },
        ],
        temperature: 0.4,
        top_p: 0.9,
        max_tokens: 200,
        stream: false,
      }),
    });

    if (!response.ok) return { ok: false, reason: "request_failed" };

    const body = await response.json();
    const insight = body?.choices?.[0]?.message?.content?.trim();
    if (!insight) return { ok: false, reason: "request_failed" };

    return { ok: true, insight };
  } catch {
    return { ok: false, reason: "request_failed" };
  }
}

const CLASS_NOTES_SYSTEM_PROMPT =
  "You are an expert tutor writing revision notes for a student from a photo of their class whiteboard. " +
  "Write clear, structured class notes in plain markdown: a short heading, then the key concepts, " +
  "equations, and diagrams you can actually see on the board, explained in your own words. Use bullet " +
  "points and sub-headings where helpful. Only describe what's genuinely visible in the image — never " +
  "invent content, and say so briefly if the board is mostly blank rather than fabricating a lesson.";

export type NvidiaClassNotesResult =
  | { ok: true; content: string; model: string }
  | { ok: false; reason: "not_configured" | "request_failed" };

/**
 * Turns a whiteboard snapshot image into written class notes via an NVIDIA
 * NIM vision-language model. Same not-configured/request-failed contract as
 * generateStudentInsight — called from an API route
 * (app/api/bookings/[id]/class-notes), never from a page directly.
 */
export async function generateClassNotes(input: {
  imageDataUrl: string;
  subjectName: string;
  mentorName: string;
  studentName: string;
  scheduledAt: string;
}): Promise<NvidiaClassNotesResult> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return { ok: false, reason: "not_configured" };

  const model = process.env.NVIDIA_VISION_MODEL || DEFAULT_VISION_MODEL;

  try {
    const response = await fetch(NVIDIA_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: CLASS_NOTES_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Subject: ${input.subjectName}\nMentor: ${input.mentorName}\nStudent: ${input.studentName}\nDate: ${input.scheduledAt}\n\nHere is a photo of the whiteboard from this class. Write the class notes.`,
              },
              { type: "image_url", image_url: { url: input.imageDataUrl } },
            ],
          },
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1024,
        stream: false,
      }),
    });

    if (!response.ok) return { ok: false, reason: "request_failed" };

    const body = await response.json();
    const content = body?.choices?.[0]?.message?.content?.trim();
    if (!content) return { ok: false, reason: "request_failed" };

    return { ok: true, content, model };
  } catch {
    return { ok: false, reason: "request_failed" };
  }
}
