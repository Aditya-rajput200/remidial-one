// vitest runs plain Node, not Next's webpack compiler, which is what
// normally swaps "server-only" for an empty module on the server build
// target. Aliased in vitest.config.ts so `import "server-only"` in
// lib/**/*.ts doesn't throw ("This module cannot be imported from a Client
// Component module") when a test imports one of those files directly.
export {};
