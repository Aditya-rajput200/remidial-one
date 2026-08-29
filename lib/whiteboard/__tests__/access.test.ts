import { describe, expect, it } from "vitest";
import { resolveWhiteboardPermission, type ResolveWhiteboardPermissionInput } from "@/lib/whiteboard/access";

const base: ResolveWhiteboardPermissionInput = {
  isMentor: false,
  isModerator: false,
  hasModerateAny: false,
  isLocked: false,
  lockedById: null,
  userId: "user-1",
  defaultPermission: "COLLABORATE",
  participantOverride: null,
};

describe("resolveWhiteboardPermission", () => {
  it("gives the mentor full collaboration regardless of lock or overrides", () => {
    expect(resolveWhiteboardPermission({ ...base, isMentor: true })).toBe("FULL_COLLABORATION");
    expect(resolveWhiteboardPermission({ ...base, isMentor: true, isLocked: true, lockedById: "someone-else" })).toBe(
      "FULL_COLLABORATION",
    );
  });

  it("gives a plain moderator/observer view-only access", () => {
    expect(resolveWhiteboardPermission({ ...base, isModerator: true })).toBe("VIEW_ONLY");
  });

  it("upgrades a moderator holding whiteboard.moderate_any to full collaboration", () => {
    expect(resolveWhiteboardPermission({ ...base, isModerator: true, hasModerateAny: true })).toBe(
      "FULL_COLLABORATION",
    );
  });

  it("falls back to the board default when a student has no override", () => {
    expect(resolveWhiteboardPermission({ ...base, defaultPermission: "COLLABORATE" })).toBe("COLLABORATE");
    expect(resolveWhiteboardPermission({ ...base, defaultPermission: "FULL_COLLABORATION" })).toBe(
      "FULL_COLLABORATION",
    );
  });

  it("uses a student's per-whiteboard override over the default", () => {
    expect(resolveWhiteboardPermission({ ...base, defaultPermission: "VIEW_ONLY", participantOverride: "FULL_COLLABORATION" })).toBe(
      "FULL_COLLABORATION",
    );
  });

  it("forces a locked-out student to view-only even with an override or a permissive default", () => {
    expect(
      resolveWhiteboardPermission({
        ...base,
        defaultPermission: "FULL_COLLABORATION",
        participantOverride: "FULL_COLLABORATION",
        isLocked: true,
        lockedById: "the-mentor",
      }),
    ).toBe("VIEW_ONLY");
  });

  it("does not restrict the lock holder themselves", () => {
    expect(
      resolveWhiteboardPermission({
        ...base,
        defaultPermission: "FULL_COLLABORATION",
        isLocked: true,
        lockedById: base.userId,
      }),
    ).toBe("FULL_COLLABORATION");
  });
});
