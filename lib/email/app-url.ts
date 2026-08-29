/** Absolute origin used to build links inside emails (verify/reset/notes). */
export function appUrl(path: string): string {
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${origin.replace(/\/+$/, "")}${path}`;
}
