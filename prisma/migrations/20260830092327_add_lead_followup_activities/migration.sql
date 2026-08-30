-- CreateEnum
CREATE TYPE "LeadActivityOutcome" AS ENUM ('CALL_NO_ANSWER', 'CALL_CONNECTED', 'EMAILED', 'WHATSAPP_SENT', 'SCHEDULED_CALL', 'NOT_INTERESTED', 'CONVERTED', 'OTHER');

-- AlterTable
ALTER TABLE "CounsellingRequest" ADD COLUMN     "nextFollowUpAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "nextFollowUpAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "CounsellingRequestActivity" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "outcome" "LeadActivityOutcome" NOT NULL,
    "note" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CounsellingRequestActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessageActivity" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "outcome" "LeadActivityOutcome" NOT NULL,
    "note" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessageActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CounsellingRequest_nextFollowUpAt_idx" ON "CounsellingRequest"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "ContactMessage_nextFollowUpAt_idx" ON "ContactMessage"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "CounsellingRequestActivity_requestId_createdAt_idx" ON "CounsellingRequestActivity"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "ContactMessageActivity_messageId_createdAt_idx" ON "ContactMessageActivity"("messageId", "createdAt");

-- AddForeignKey
ALTER TABLE "CounsellingRequestActivity" ADD CONSTRAINT "CounsellingRequestActivity_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CounsellingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounsellingRequestActivity" ADD CONSTRAINT "CounsellingRequestActivity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessageActivity" ADD CONSTRAINT "ContactMessageActivity_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ContactMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessageActivity" ADD CONSTRAINT "ContactMessageActivity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
