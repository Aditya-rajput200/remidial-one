import fs from "node:fs";
import path from "node:path";

/**
 * Resolves a path under /public to a usable src, but only if the file has
 * actually been dropped in — so components can fall back to a placeholder
 * until real creative is added, with no code change needed once it lands.
 */
export function publicAsset(relativePath: string): string | undefined {
  const cleaned = relativePath.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", cleaned);
  return fs.existsSync(filePath) ? `/${cleaned}` : undefined;
}
