import "server-only";
import type { AIProvider, AIResult } from "@/lib/ai/provider";

const CHAT_COMPLETIONS_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const DEFAULT_TEXT_MODEL = "meta/llama-3.1-8b-instruct";
const DEFAULT_VISION_MODEL = "meta/llama-3.2-11b-vision-instruct";

// Separate env vars from lib/ai/nvidia.ts's NVIDIA_MODEL/NVIDIA_VISION_MODEL
// so the assessment engine can be pointed at a different model/account
// without disturbing the existing class-notes/progress-insight features.
const textModel = process.env.ASSESSMENT_AI_MODEL || DEFAULT_TEXT_MODEL;
const visionModel = process.env.ASSESSMENT_AI_VISION_MODEL || DEFAULT_VISION_MODEL;

async function callNvidia(body: Record<string, unknown>): Promise<AIResult<string>> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return { ok: false, reason: "not_configured" };

  try {
    const response = await fetch(CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return { ok: false, reason: "request_failed" };

    const json = await response.json();
    const text: string | undefined = json?.choices?.[0]?.message?.content?.trim();
    if (!text) return { ok: false, reason: "request_failed" };

    return { ok: true, data: text };
  } catch {
    return { ok: false, reason: "request_failed" };
  }
}

export const nvidiaProvider: AIProvider = {
  modelName: textModel,
  visionModelName: visionModel,

  async generateText({ system, user, maxTokens = 1024, temperature = 0.3 }) {
    return callNvidia({
      model: textModel,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature,
      top_p: 0.9,
      max_tokens: maxTokens,
      stream: false,
    });
  },

  async generateVision({ system, user, imageDataUrl, maxTokens = 1024 }) {
    return callNvidia({
      model: visionModel,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: user },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ],
        },
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: maxTokens,
      stream: false,
    });
  },
};
