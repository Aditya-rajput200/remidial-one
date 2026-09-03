// X/Twitter uses the same branded card as OpenGraph. Re-exporting the
// opengraph-image route keeps a single source of truth and emits an explicit
// twitter:image tag (rather than relying on parsers falling back to og:image).
export { default, alt, size, contentType } from "./opengraph-image";
