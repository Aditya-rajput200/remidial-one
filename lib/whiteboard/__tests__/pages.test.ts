import { describe, expect, it } from "vitest";
import { computeReorderedPositions } from "@/lib/whiteboard/pages";

describe("computeReorderedPositions", () => {
  it("assigns sequential positions in the given order", () => {
    const result = computeReorderedPositions(["a", "b", "c"]);
    expect(result.get("a")).toBe(0);
    expect(result.get("b")).toBe(1);
    expect(result.get("c")).toBe(2);
  });

  it("handles moving the last page to the start", () => {
    const result = computeReorderedPositions(["c", "a", "b"]);
    expect(result.get("c")).toBe(0);
    expect(result.get("a")).toBe(1);
    expect(result.get("b")).toBe(2);
  });

  it("handles moving the first page to the end", () => {
    const result = computeReorderedPositions(["b", "c", "a"]);
    expect(result.get("b")).toBe(0);
    expect(result.get("c")).toBe(1);
    expect(result.get("a")).toBe(2);
  });

  it("handles a single-page board", () => {
    const result = computeReorderedPositions(["only"]);
    expect(result.get("only")).toBe(0);
    expect(result.size).toBe(1);
  });

  it("handles an empty page list", () => {
    const result = computeReorderedPositions([]);
    expect(result.size).toBe(0);
  });
});
