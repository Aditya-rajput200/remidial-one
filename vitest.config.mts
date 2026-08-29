import "dotenv/config";
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "server-only": path.resolve(import.meta.dirname, "./vitest.setup/server-only-shim.ts"),
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
