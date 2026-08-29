-- DropForeignKey
ALTER TABLE "StudentModuleAttempt" DROP CONSTRAINT "StudentModuleAttempt_moduleId_fkey";

-- AddForeignKey
ALTER TABLE "StudentModuleAttempt" ADD CONSTRAINT "StudentModuleAttempt_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AssessmentModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
