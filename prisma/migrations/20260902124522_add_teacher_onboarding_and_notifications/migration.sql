-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TEACHER_FORM_REQUIRED', 'TEACHER_DOCUMENTS_PENDING', 'TEACHER_COUNSELING_SCHEDULED', 'TEACHER_DEMO_SCHEDULED', 'TEACHER_APPLICATION_UNDER_REVIEW', 'TEACHER_APPLICATION_APPROVED', 'TEACHER_APPLICATION_REJECTED', 'TEACHER_APPLICATION_NEEDS_CORRECTION', 'TEACHER_PROFILE_COMPLETION_REQUIRED', 'NEW_TEACHER_LEAD', 'TEACHER_FORM_SUBMITTED', 'TEACHER_READY_FOR_VERIFICATION', 'GENERAL');

-- CreateEnum
CREATE TYPE "TeacherLeadStatus" AS ENUM ('NEW', 'CONTACTED', 'FORM_SENT', 'FORM_SUBMITTED', 'DOCUMENTS_PENDING', 'UNDER_REVIEW', 'COUNSELING_PENDING', 'COUNSELING_COMPLETED', 'DEMO_PENDING', 'DEMO_COMPLETED', 'ASSESSMENT_PENDING', 'ASSESSMENT_COMPLETED', 'VERIFICATION_PENDING', 'APPROVED', 'REJECTED', 'ONBOARDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TeacherOnboardingStageKey" AS ENUM ('CONTACT', 'FORM', 'DOCUMENTS', 'COUNSELING', 'DEMO', 'ASSESSMENT', 'VERIFICATION', 'APPROVAL', 'PROFILE', 'ONBOARDED');

-- CreateEnum
CREATE TYPE "OnboardingStageState" AS ENUM ('PENDING', 'CURRENT', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TeacherDocumentType" AS ENUM ('AADHAAR', 'PAN', 'QUALIFICATION_CERTIFICATE', 'EXPERIENCE_CERTIFICATE', 'PHOTO', 'OTHER');

-- CreateEnum
CREATE TYPE "TeacherCounselingOutcome" AS ENUM ('PASS', 'HOLD', 'REQUIRES_FOLLOW_UP', 'REJECT');

-- CreateEnum
CREATE TYPE "TeacherDemoResult" AS ENUM ('PASS', 'FAIL', 'REDEMO_REQUIRED');

-- CreateEnum
CREATE TYPE "TeacherVerificationAction" AS ENUM ('APPROVE', 'REJECT', 'SEND_BACK', 'REQUEST_INFO');

-- AlterEnum
ALTER TYPE "MentorApplicationStatus" ADD VALUE 'NEEDS_CORRECTION';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COUNSELOR';

-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "addressLine" TEXT,
ADD COLUMN     "boards" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "city" TEXT,
ADD COLUMN     "currentOccupation" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "degree" TEXT,
ADD COLUMN     "expectedRate" DECIMAL(10,2),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "highestQualification" TEXT,
ADD COLUMN     "institution" TEXT,
ADD COLUMN     "onboardedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingFormSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "preferredClassDurationMin" INTEGER,
ADD COLUMN     "preferredDays" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "preferredHours" TEXT,
ADD COLUMN     "preferredMode" TEXT,
ADD COLUMN     "preferredStudentAgeGroup" TEXT,
ADD COLUMN     "previousExperience" TEXT,
ADD COLUMN     "qualificationYear" INTEGER,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "techSetup" JSONB,
ADD COLUMN     "whatsapp" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "linkUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "city" TEXT,
    "state" TEXT,
    "source" TEXT,
    "interestedSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interestedGrades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "message" TEXT,
    "status" "TeacherLeadStatus" NOT NULL DEFAULT 'NEW',
    "assignedToId" TEXT,
    "internalNotes" TEXT,
    "contactedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "mentorProfileId" TEXT,
    "convertedUserId" TEXT,
    "convertedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherLeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "outcome" "LeadActivityOutcome" NOT NULL,
    "note" TEXT,
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherLeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherOnboardingStage" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "key" "TeacherOnboardingStageKey" NOT NULL,
    "state" "OnboardingStageState" NOT NULL DEFAULT 'PENDING',
    "responsibleId" TEXT,
    "notes" TEXT,
    "enteredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherOnboardingStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherDocument" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "type" "TeacherDocumentType" NOT NULL,
    "blobPathname" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherCounseling" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "counselorId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "mode" TEXT,
    "notes" TEXT,
    "teacherExpectations" TEXT,
    "subjectDiscussion" TEXT,
    "experienceVerified" BOOLEAN,
    "communicationNotes" TEXT,
    "availabilityNotes" TEXT,
    "compensationNotes" TEXT,
    "recommendation" TEXT,
    "outcome" "TeacherCounselingOutcome",
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherCounseling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherDemo" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "subject" TEXT,
    "gradeLabel" TEXT,
    "topic" TEXT,
    "durationMinutes" INTEGER,
    "meetingLink" TEXT,
    "evaluatorId" TEXT,
    "notes" TEXT,
    "result" "TeacherDemoResult",
    "ratings" JSONB,
    "evaluatorComments" TEXT,
    "evaluatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherDemo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherTechAssessment" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "adminNotes" TEXT,
    "assessedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherTechAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherVerificationEvent" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "action" "TeacherVerificationAction" NOT NULL,
    "reason" TEXT,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherVerificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherLead_mentorProfileId_key" ON "TeacherLead"("mentorProfileId");

-- CreateIndex
CREATE INDEX "TeacherLead_status_createdAt_idx" ON "TeacherLead"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherLead_assignedToId_idx" ON "TeacherLead"("assignedToId");

-- CreateIndex
CREATE INDEX "TeacherLead_nextFollowUpAt_idx" ON "TeacherLead"("nextFollowUpAt");

-- CreateIndex
CREATE INDEX "TeacherLeadActivity_leadId_createdAt_idx" ON "TeacherLeadActivity"("leadId", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherOnboardingStage_mentorProfileId_idx" ON "TeacherOnboardingStage"("mentorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherOnboardingStage_mentorProfileId_key_key" ON "TeacherOnboardingStage"("mentorProfileId", "key");

-- CreateIndex
CREATE INDEX "TeacherDocument_mentorProfileId_idx" ON "TeacherDocument"("mentorProfileId");

-- CreateIndex
CREATE INDEX "TeacherCounseling_mentorProfileId_createdAt_idx" ON "TeacherCounseling"("mentorProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "TeacherDemo_mentorProfileId_idx" ON "TeacherDemo"("mentorProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherTechAssessment_mentorProfileId_key" ON "TeacherTechAssessment"("mentorProfileId");

-- CreateIndex
CREATE INDEX "TeacherVerificationEvent_mentorProfileId_createdAt_idx" ON "TeacherVerificationEvent"("mentorProfileId", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLead" ADD CONSTRAINT "TeacherLead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLead" ADD CONSTRAINT "TeacherLead_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLeadActivity" ADD CONSTRAINT "TeacherLeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "TeacherLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherLeadActivity" ADD CONSTRAINT "TeacherLeadActivity_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherOnboardingStage" ADD CONSTRAINT "TeacherOnboardingStage_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherOnboardingStage" ADD CONSTRAINT "TeacherOnboardingStage_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherDocument" ADD CONSTRAINT "TeacherDocument_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherDocument" ADD CONSTRAINT "TeacherDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherDocument" ADD CONSTRAINT "TeacherDocument_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCounseling" ADD CONSTRAINT "TeacherCounseling_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherCounseling" ADD CONSTRAINT "TeacherCounseling_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherDemo" ADD CONSTRAINT "TeacherDemo_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherDemo" ADD CONSTRAINT "TeacherDemo_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTechAssessment" ADD CONSTRAINT "TeacherTechAssessment_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherTechAssessment" ADD CONSTRAINT "TeacherTechAssessment_assessedById_fkey" FOREIGN KEY ("assessedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherVerificationEvent" ADD CONSTRAINT "TeacherVerificationEvent_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherVerificationEvent" ADD CONSTRAINT "TeacherVerificationEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
