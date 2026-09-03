-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "applicationTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "applicationTokenHash" TEXT,
ADD COLUMN     "availabilityHoursPerWeek" INTEGER,
ADD COLUMN     "employmentType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_applicationTokenHash_key" ON "MentorProfile"("applicationTokenHash");
