-- CreateTable
CREATE TABLE "ClassNote" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "generatedById" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "snapshotImageUrl" TEXT,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassNote_bookingId_key" ON "ClassNote"("bookingId");

-- CreateIndex
CREATE INDEX "ClassNote_bookingId_idx" ON "ClassNote"("bookingId");

-- CreateIndex
CREATE INDEX "ClassNote_generatedById_idx" ON "ClassNote"("generatedById");

-- AddForeignKey
ALTER TABLE "ClassNote" ADD CONSTRAINT "ClassNote_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassNote" ADD CONSTRAINT "ClassNote_generatedById_fkey" FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
