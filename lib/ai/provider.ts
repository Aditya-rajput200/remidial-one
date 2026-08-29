import "server-only";

/**
 * Provider-agnostic AI interface (spec §45) — every assessment AI feature
 * (question generation, subjective-answer suggestions, insight summaries)
 * calls only this, never a vendor SDK directly. Swapping providers means
 * writing one new file under lib/ai/providers/ and changing getAIProvider()
 * below; no call-site changes. lib/ai/nvidia.ts (class notes, progress
 * insight) is a separate, pre-existing integration and is untouched by this.
 */

export type AIResult<T> = { ok: true; data: T } | { ok: false; reason: "not_configured" | "request_failed" };

export interface AIProvider {
  generateText(input: { system: string; user: string; maxTokens?: number; temperature?: number }): Promise<AIResult<string>>;
  generateVision(input: {
    system: string;
    user: string;
    imageDataUrl: string;
    maxTokens?: number;
  }): Promise<AIResult<string>>;
  readonly modelName: string;
  readonly visionModelName: string;
}

let cachedProvider: AIProvider | undefined;

export async function getAIProvider(): Promise<AIProvider> {
  if (!cachedProvider) {
    const { nvidiaProvider } = await import("./providers/nvidiaProvider");
    cachedProvider = nvidiaProvider;
  }
  return cachedProvider;
}
