-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "actualEndedAt" TIMESTAMP(3),
ADD COLUMN     "actualStartedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT;

-- CreateTable
CREATE TABLE "SessionAttendance" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "SessionAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionAttendance_bookingId_idx" ON "SessionAttendance"("bookingId");

-- CreateIndex
CREATE INDEX "SessionAttendance_userId_idx" ON "SessionAttendance"("userId");

-- AddForeignKey
ALTER TABLE "SessionAttendance" ADD CONSTRAINT "SessionAttendance_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAttendance" ADD CONSTRAINT "SessionAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
