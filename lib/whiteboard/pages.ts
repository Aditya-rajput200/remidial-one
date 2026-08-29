import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Pure position-assignment for a reorder: pageIdsInOrder[i] gets position i.
 * Kept separate from the persistence call below so it's unit-testable
 * without a database.
 */
export function computeReorderedPositions(pageIdsInOrder: string[]): Map<string, number> {
  return new Map(pageIdsInOrder.map((id, index) => [id, index]));
}

/**
 * Rewrites every page's position for a whiteboard in one transaction.
 * Position is a plain indexed Int, not @@unique, specifically so this can
 * run as a batch of updates without hitting a uniqueness conflict
 * mid-transaction (see the WhiteboardPage.position comment in schema.prisma).
 */
export async function reorderWhiteboardPages(whiteboardId: string, pageIdsInOrder: string[]) {
  const positions = computeReorderedPositions(pageIdsInOrder);
  return prisma.$transaction(
    pageIdsInOrder.map((id) =>
      prisma.whiteboardPage.update({
        where: { id, whiteboardId },
        data: { position: positions.get(id)! },
      }),
    ),
  );
}
