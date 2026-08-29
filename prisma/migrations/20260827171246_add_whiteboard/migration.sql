-- CreateEnum
CREATE TYPE "WhiteboardObjectType" AS ENUM ('PATH', 'LINE', 'ARROW', 'RECTANGLE', 'ELLIPSE', 'TRIANGLE', 'TEXT', 'STICKY_NOTE', 'EQUATION', 'IMAGE');

-- CreateEnum
CREATE TYPE "WhiteboardOperationType" AS ENUM ('OBJECT_CREATE', 'OBJECT_UPDATE', 'OBJECT_DELETE', 'PAGE_CREATE', 'PAGE_UPDATE', 'PAGE_DELETE', 'PAGE_REORDER', 'BOARD_LOCK', 'BOARD_UNLOCK');

-- CreateEnum
CREATE TYPE "WhiteboardPermissionLevel" AS ENUM ('VIEW_ONLY', 'COLLABORATE', 'FULL_COLLABORATION');

-- CreateEnum
CREATE TYPE "WhiteboardBackground" AS ENUM ('BLANK', 'GRID', 'RULED', 'DOTTED', 'GRAPH_PAPER');

-- CreateTable
CREATE TABLE "Whiteboard" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "defaultPermission" "WhiteboardPermissionLevel" NOT NULL DEFAULT 'COLLABORATE',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedById" TEXT,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Whiteboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteboardPage" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Page 1',
    "position" INTEGER NOT NULL,
    "background" "WhiteboardBackground" NOT NULL DEFAULT 'BLANK',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhiteboardPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteboardObject" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "type" "WhiteboardObjectType" NOT NULL,
    "createdById" TEXT NOT NULL,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhiteboardObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteboardOperation" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "pageId" TEXT,
    "objectId" TEXT,
    "type" "WhiteboardOperationType" NOT NULL,
    "actorId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "clientOpId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhiteboardOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteboardSnapshot" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "upToOperationId" TEXT NOT NULL,
    "upToCreatedAt" TIMESTAMP(3) NOT NULL,
    "objects" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhiteboardSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhiteboardParticipant" (
    "id" TEXT NOT NULL,
    "whiteboardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "WhiteboardPermissionLevel",
    "color" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhiteboardParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Whiteboard_bookingId_key" ON "Whiteboard"("bookingId");

-- CreateIndex
CREATE INDEX "Whiteboard_bookingId_idx" ON "Whiteboard"("bookingId");

-- CreateIndex
CREATE INDEX "WhiteboardPage_whiteboardId_position_idx" ON "WhiteboardPage"("whiteboardId", "position");

-- CreateIndex
CREATE INDEX "WhiteboardObject_pageId_isDeleted_idx" ON "WhiteboardObject"("pageId", "isDeleted");

-- CreateIndex
CREATE INDEX "WhiteboardObject_pageId_zIndex_idx" ON "WhiteboardObject"("pageId", "zIndex");

-- CreateIndex
CREATE INDEX "WhiteboardObject_createdById_idx" ON "WhiteboardObject"("createdById");

-- CreateIndex
CREATE INDEX "WhiteboardOperation_whiteboardId_createdAt_idx" ON "WhiteboardOperation"("whiteboardId", "createdAt");

-- CreateIndex
CREATE INDEX "WhiteboardOperation_pageId_idx" ON "WhiteboardOperation"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteboardOperation_whiteboardId_clientOpId_key" ON "WhiteboardOperation"("whiteboardId", "clientOpId");

-- CreateIndex
CREATE INDEX "WhiteboardSnapshot_whiteboardId_pageId_upToCreatedAt_idx" ON "WhiteboardSnapshot"("whiteboardId", "pageId", "upToCreatedAt");

-- CreateIndex
CREATE INDEX "WhiteboardParticipant_whiteboardId_idx" ON "WhiteboardParticipant"("whiteboardId");

-- CreateIndex
CREATE UNIQUE INDEX "WhiteboardParticipant_whiteboardId_userId_key" ON "WhiteboardParticipant"("whiteboardId", "userId");

-- AddForeignKey
ALTER TABLE "Whiteboard" ADD CONSTRAINT "Whiteboard_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardPage" ADD CONSTRAINT "WhiteboardPage_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardPage" ADD CONSTRAINT "WhiteboardPage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardObject" ADD CONSTRAINT "WhiteboardObject_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "WhiteboardPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardObject" ADD CONSTRAINT "WhiteboardObject_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardOperation" ADD CONSTRAINT "WhiteboardOperation_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardOperation" ADD CONSTRAINT "WhiteboardOperation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "WhiteboardPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardOperation" ADD CONSTRAINT "WhiteboardOperation_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardSnapshot" ADD CONSTRAINT "WhiteboardSnapshot_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardSnapshot" ADD CONSTRAINT "WhiteboardSnapshot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "WhiteboardPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardParticipant" ADD CONSTRAINT "WhiteboardParticipant_whiteboardId_fkey" FOREIGN KEY ("whiteboardId") REFERENCES "Whiteboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhiteboardParticipant" ADD CONSTRAINT "WhiteboardParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
