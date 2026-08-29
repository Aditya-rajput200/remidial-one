-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'MULTIPLE_CORRECT', 'TRUE_FALSE', 'FILL_BLANK', 'MATCH_FOLLOWING', 'SHORT_ANSWER', 'LONG_ANSWER', 'IMAGE_ANSWER', 'NUMERICAL', 'EQUATION');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'VERY_HARD');

-- CreateEnum
CREATE TYPE "CognitiveLevel" AS ENUM ('REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE');

-- CreateEnum
CREATE TYPE "QuestionSkill" AS ENUM ('MEMORY', 'RECALL', 'CONCEPTUAL_UNDERSTANDING', 'READING', 'WRITING', 'MENTAL_ABILITY', 'LOGICAL_REASONING', 'CRITICAL_THINKING', 'PROBLEM_SOLVING', 'ANALYTICAL_THINKING', 'APPLICATION', 'CALCULATION', 'INTERPRETATION', 'CREATIVITY', 'COMMUNICATION');

-- CreateEnum
CREATE TYPE "QuestionPurpose" AS ENUM ('DIAGNOSTIC', 'PRACTICE', 'REVISION', 'ASSESSMENT', 'COMPETITIVE', 'REMEDIAL', 'MASTERY');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('DRAFT', 'APPROVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionSource" AS ENUM ('MANUAL', 'AI_GENERATED', 'IMPORTED');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'REVIEW', 'SCHEDULED', 'LIVE', 'PAUSED', 'ENDED', 'EVALUATION', 'RESULT_READY', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ResultVisibility" AS ENUM ('SCORE_ONLY', 'SCORE_AND_ANSWERS', 'FULL_DETAIL');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuestionAttemptState" AS ENUM ('NOT_VISITED', 'VISITED', 'ANSWERED', 'MARKED_FOR_REVIEW', 'ANSWERED_MARKED');

-- CreateEnum
CREATE TYPE "SubmissionReason" AS ENUM ('MANUAL', 'AUTO_SUBMITTED', 'TIME_EXPIRED', 'TEACHER_ENDED');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'AI_SUGGESTED', 'TEACHER_REVIEWED', 'FINALIZED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('EVALUATION_PENDING', 'UNDER_REVIEW', 'READY_TO_PUBLISH', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "FeedbackScope" AS ENUM ('OVERALL', 'MODULE', 'QUESTION', 'CHAPTER');

-- CreateEnum
CREATE TYPE "RecommendationSource" AS ENUM ('AI', 'TEACHER');

-- CreateEnum
CREATE TYPE "AssessmentEventType" AS ENUM ('TEST_STARTED', 'QUESTION_VIEWED', 'ANSWER_SAVED', 'ANSWER_CHANGED', 'MARKED_FOR_REVIEW', 'MODULE_STARTED', 'MODULE_COMPLETED', 'TEST_SUBMITTED', 'TEST_AUTO_SUBMITTED', 'TEST_PAUSED', 'TEST_RESUMED');

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "subjectId" TEXT,
    "chapterId" TEXT,
    "topicId" TEXT,
    "subtopic" TEXT,
    "type" "QuestionType" NOT NULL,
    "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "cognitiveLevel" "CognitiveLevel" NOT NULL DEFAULT 'UNDERSTAND',
    "skills" "QuestionSkill"[] DEFAULT ARRAY[]::"QuestionSkill"[],
    "purpose" "QuestionPurpose" NOT NULL DEFAULT 'ASSESSMENT',
    "status" "QuestionStatus" NOT NULL DEFAULT 'DRAFT',
    "source" "QuestionSource" NOT NULL DEFAULT 'MANUAL',
    "text" TEXT NOT NULL,
    "explanation" TEXT,
    "hint" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "defaultMarks" DECIMAL(6,2) NOT NULL DEFAULT 1,
    "defaultNegativeMarks" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "estimatedTimeSeconds" INTEGER NOT NULL DEFAULT 60,
    "content" JSONB NOT NULL,
    "media" JSONB,
    "aiMeta" JSONB,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subjectId" TEXT,
    "gradeLabel" TEXT,
    "difficulty" "QuestionDifficulty",
    "instructions" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "totalMarks" DECIMAL(7,2) NOT NULL DEFAULT 0,
    "passingMarks" DECIMAL(7,2),
    "attemptLimit" INTEGER NOT NULL DEFAULT 1,
    "negativeMarkingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "calculatorAllowed" BOOLEAN NOT NULL DEFAULT false,
    "freeNavigation" BOOLEAN NOT NULL DEFAULT true,
    "autoSubmitOnExpiry" BOOLEAN NOT NULL DEFAULT true,
    "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false,
    "randomizeOptions" BOOLEAN NOT NULL DEFAULT false,
    "resultVisibility" "ResultVisibility" NOT NULL DEFAULT 'SCORE_ONLY',
    "showCorrectAnswers" BOOLEAN NOT NULL DEFAULT false,
    "showSolutions" BOOLEAN NOT NULL DEFAULT false,
    "showRank" BOOLEAN NOT NULL DEFAULT false,
    "showClassAverage" BOOLEAN NOT NULL DEFAULT false,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "publishedSnapshot" JSONB,
    "resultsPublishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAssignment" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentModule" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "timeLimitMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentModuleQuestion" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "marks" DECIMAL(6,2) NOT NULL,
    "negativeMarks" DECIMAL(6,2) NOT NULL DEFAULT 0,

    CONSTRAINT "AssessmentModuleQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAssessment" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "AttemptStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "serverExpiresAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "submissionReason" "SubmissionReason",
    "totalMarksObtained" DECIMAL(7,2),
    "totalMaxMarks" DECIMAL(7,2),
    "accuracyPercent" DECIMAL(5,2),
    "timeSpentSeconds" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentModuleAttempt" (
    "id" TEXT NOT NULL,
    "studentAssessmentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StudentModuleAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentQuestionAttempt" (
    "id" TEXT NOT NULL,
    "studentAssessmentId" TEXT NOT NULL,
    "moduleQuestionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "state" "QuestionAttemptState" NOT NULL DEFAULT 'NOT_VISITED',
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "firstAnsweredAt" TIMESTAMP(3),
    "lastAnsweredAt" TIMESTAMP(3),
    "changeCount" INTEGER NOT NULL DEFAULT 0,
    "isCorrect" BOOLEAN,
    "marksObtained" DECIMAL(6,2),

    CONSTRAINT "StudentQuestionAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAnswer" (
    "id" TEXT NOT NULL,
    "questionAttemptId" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "autosavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnswerAttachment" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnswerAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "questionAttemptId" TEXT NOT NULL,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "finalMarks" DECIMAL(6,2),
    "evaluatedById" TEXT,
    "evaluatedAt" TIMESTAMP(3),
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIEvaluation" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "suggestedMarks" DECIMAL(6,2),
    "keyPointsFound" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "missingConcepts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "incorrectConcepts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedFeedback" TEXT,
    "ocrText" TEXT,
    "model" TEXT NOT NULL,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentResult" (
    "id" TEXT NOT NULL,
    "studentAssessmentId" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'EVALUATION_PENDING',
    "totalMarksObtained" DECIMAL(7,2) NOT NULL,
    "totalMaxMarks" DECIMAL(7,2) NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "accuracyPercent" DECIMAL(5,2) NOT NULL,
    "rank" INTEGER,
    "percentile" DECIMAL(5,2),
    "overallFeedback" TEXT,
    "publishedAt" TIMESTAMP(3),
    "publishedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterMetric" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "attempted" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "incorrect" INTEGER NOT NULL,
    "marksObtained" DECIMAL(6,2) NOT NULL,
    "maxMarks" DECIMAL(6,2) NOT NULL,
    "accuracyPercent" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "ChapterMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicMetric" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "attempted" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "incorrect" INTEGER NOT NULL,
    "marksObtained" DECIMAL(6,2) NOT NULL,
    "maxMarks" DECIMAL(6,2) NOT NULL,
    "accuracyPercent" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "TopicMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillMetric" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "skill" "QuestionSkill" NOT NULL,
    "attempted" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "incorrect" INTEGER NOT NULL,
    "marksObtained" DECIMAL(6,2) NOT NULL,
    "maxMarks" DECIMAL(6,2) NOT NULL,
    "accuracyPercent" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "SkillMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CognitiveMetric" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "level" "CognitiveLevel" NOT NULL,
    "attempted" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "incorrect" INTEGER NOT NULL,
    "marksObtained" DECIMAL(6,2) NOT NULL,
    "maxMarks" DECIMAL(6,2) NOT NULL,
    "accuracyPercent" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "CognitiveMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTypeMetric" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "attempted" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "incorrect" INTEGER NOT NULL,
    "averageTimeSeconds" INTEGER NOT NULL,
    "accuracyPercent" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "QuestionTypeMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentMetric" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "completedCount" INTEGER NOT NULL DEFAULT 0,
    "averageScore" DECIMAL(5,2),
    "highestScore" DECIMAL(5,2),
    "lowestScore" DECIMAL(5,2),
    "medianScore" DECIMAL(5,2),
    "averageAccuracy" DECIMAL(5,2),
    "averageTimeSeconds" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionMetric" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "timesAttempted" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "timesIncorrect" INTEGER NOT NULL DEFAULT 0,
    "timesSkipped" INTEGER NOT NULL DEFAULT 0,
    "averageTimeSeconds" INTEGER,
    "optionDistribution" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIInsight" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conceptGaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cognitiveGaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "skillGaps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timeManagementNote" TEXT,
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggestedNextAssessment" TEXT,
    "teacherActionNote" TEXT,
    "model" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "scope" "FeedbackScope" NOT NULL,
    "moduleId" TEXT,
    "questionId" TEXT,
    "chapterId" TEXT,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "resultId" TEXT,
    "content" TEXT NOT NULL,
    "source" "RecommendationSource" NOT NULL DEFAULT 'AI',
    "overriddenById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentLearningProfile" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "overallMasteryPercent" DECIMAL(5,2),
    "subjectMastery" JSONB,
    "chapterMastery" JSONB,
    "skillMastery" JSONB,
    "cognitiveProfile" JSONB,
    "persistentWeakAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "improvingAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "assessmentsCompleted" INTEGER NOT NULL DEFAULT 0,
    "lastAssessmentAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentLearningProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentEvent" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "studentAssessmentId" TEXT,
    "actorId" TEXT NOT NULL,
    "type" "AssessmentEventType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chapter_subjectId_idx" ON "Chapter"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_subjectId_name_key" ON "Chapter"("subjectId", "name");

-- CreateIndex
CREATE INDEX "Topic_chapterId_idx" ON "Topic"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_chapterId_name_key" ON "Topic"("chapterId", "name");

-- CreateIndex
CREATE INDEX "Question_createdById_idx" ON "Question"("createdById");

-- CreateIndex
CREATE INDEX "Question_subjectId_idx" ON "Question"("subjectId");

-- CreateIndex
CREATE INDEX "Question_chapterId_idx" ON "Question"("chapterId");

-- CreateIndex
CREATE INDEX "Question_topicId_idx" ON "Question"("topicId");

-- CreateIndex
CREATE INDEX "Question_type_idx" ON "Question"("type");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE INDEX "Question_cognitiveLevel_idx" ON "Question"("cognitiveLevel");

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "Question"("status");

-- CreateIndex
CREATE INDEX "Assessment_createdById_idx" ON "Assessment"("createdById");

-- CreateIndex
CREATE INDEX "Assessment_status_idx" ON "Assessment"("status");

-- CreateIndex
CREATE INDEX "Assessment_subjectId_idx" ON "Assessment"("subjectId");

-- CreateIndex
CREATE INDEX "AssessmentAssignment_studentId_idx" ON "AssessmentAssignment"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAssignment_assessmentId_studentId_key" ON "AssessmentAssignment"("assessmentId", "studentId");

-- CreateIndex
CREATE INDEX "AssessmentModule_assessmentId_order_idx" ON "AssessmentModule"("assessmentId", "order");

-- CreateIndex
CREATE INDEX "AssessmentModuleQuestion_moduleId_order_idx" ON "AssessmentModuleQuestion"("moduleId", "order");

-- CreateIndex
CREATE INDEX "AssessmentModuleQuestion_questionId_idx" ON "AssessmentModuleQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentModuleQuestion_moduleId_questionId_key" ON "AssessmentModuleQuestion"("moduleId", "questionId");

-- CreateIndex
CREATE INDEX "StudentAssessment_assessmentId_idx" ON "StudentAssessment"("assessmentId");

-- CreateIndex
CREATE INDEX "StudentAssessment_studentId_idx" ON "StudentAssessment"("studentId");

-- CreateIndex
CREATE INDEX "StudentAssessment_status_idx" ON "StudentAssessment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAssessment_assessmentId_studentId_attemptNumber_key" ON "StudentAssessment"("assessmentId", "studentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "StudentModuleAttempt_moduleId_idx" ON "StudentModuleAttempt"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentModuleAttempt_studentAssessmentId_moduleId_key" ON "StudentModuleAttempt"("studentAssessmentId", "moduleId");

-- CreateIndex
CREATE INDEX "StudentQuestionAttempt_studentAssessmentId_idx" ON "StudentQuestionAttempt"("studentAssessmentId");

-- CreateIndex
CREATE INDEX "StudentQuestionAttempt_questionId_idx" ON "StudentQuestionAttempt"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentQuestionAttempt_studentAssessmentId_moduleQuestionId_key" ON "StudentQuestionAttempt"("studentAssessmentId", "moduleQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswer_questionAttemptId_key" ON "StudentAnswer"("questionAttemptId");

-- CreateIndex
CREATE INDEX "AnswerAttachment_answerId_idx" ON "AnswerAttachment"("answerId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_questionAttemptId_key" ON "Evaluation"("questionAttemptId");

-- CreateIndex
CREATE INDEX "Evaluation_status_idx" ON "Evaluation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AIEvaluation_evaluationId_key" ON "AIEvaluation"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentResult_studentAssessmentId_key" ON "AssessmentResult"("studentAssessmentId");

-- CreateIndex
CREATE INDEX "AssessmentResult_studentAssessmentId_idx" ON "AssessmentResult"("studentAssessmentId");

-- CreateIndex
CREATE INDEX "AssessmentResult_status_idx" ON "AssessmentResult"("status");

-- CreateIndex
CREATE INDEX "ChapterMetric_chapterId_idx" ON "ChapterMetric"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterMetric_resultId_chapterId_key" ON "ChapterMetric"("resultId", "chapterId");

-- CreateIndex
CREATE INDEX "TopicMetric_topicId_idx" ON "TopicMetric"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicMetric_resultId_topicId_key" ON "TopicMetric"("resultId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillMetric_resultId_skill_key" ON "SkillMetric"("resultId", "skill");

-- CreateIndex
CREATE UNIQUE INDEX "CognitiveMetric_resultId_level_key" ON "CognitiveMetric"("resultId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTypeMetric_resultId_type_key" ON "QuestionTypeMetric"("resultId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentMetric_assessmentId_key" ON "AssessmentMetric"("assessmentId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionMetric_questionId_key" ON "QuestionMetric"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AIInsight_resultId_key" ON "AIInsight"("resultId");

-- CreateIndex
CREATE INDEX "Feedback_resultId_idx" ON "Feedback"("resultId");

-- CreateIndex
CREATE INDEX "Recommendation_studentId_idx" ON "Recommendation"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentLearningProfile_studentId_key" ON "StudentLearningProfile"("studentId");

-- CreateIndex
CREATE INDEX "AssessmentEvent_assessmentId_createdAt_idx" ON "AssessmentEvent"("assessmentId", "createdAt");

-- CreateIndex
CREATE INDEX "AssessmentEvent_studentAssessmentId_idx" ON "AssessmentEvent"("studentAssessmentId");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAssignment" ADD CONSTRAINT "AssessmentAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModule" ADD CONSTRAINT "AssessmentModule_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModuleQuestion" ADD CONSTRAINT "AssessmentModuleQuestion_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AssessmentModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentModuleQuestion" ADD CONSTRAINT "AssessmentModuleQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssessment" ADD CONSTRAINT "StudentAssessment_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAssessment" ADD CONSTRAINT "StudentAssessment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentModuleAttempt" ADD CONSTRAINT "StudentModuleAttempt_studentAssessmentId_fkey" FOREIGN KEY ("studentAssessmentId") REFERENCES "StudentAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentModuleAttempt" ADD CONSTRAINT "StudentModuleAttempt_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AssessmentModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQuestionAttempt" ADD CONSTRAINT "StudentQuestionAttempt_studentAssessmentId_fkey" FOREIGN KEY ("studentAssessmentId") REFERENCES "StudentAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQuestionAttempt" ADD CONSTRAINT "StudentQuestionAttempt_moduleQuestionId_fkey" FOREIGN KEY ("moduleQuestionId") REFERENCES "AssessmentModuleQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentQuestionAttempt" ADD CONSTRAINT "StudentQuestionAttempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_questionAttemptId_fkey" FOREIGN KEY ("questionAttemptId") REFERENCES "StudentQuestionAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnswerAttachment" ADD CONSTRAINT "AnswerAttachment_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "StudentAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_questionAttemptId_fkey" FOREIGN KEY ("questionAttemptId") REFERENCES "StudentQuestionAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_evaluatedById_fkey" FOREIGN KEY ("evaluatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIEvaluation" ADD CONSTRAINT "AIEvaluation_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_studentAssessmentId_fkey" FOREIGN KEY ("studentAssessmentId") REFERENCES "StudentAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterMetric" ADD CONSTRAINT "ChapterMetric_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AssessmentResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterMetric" ADD CONSTRAINT "ChapterMetric_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMetric" ADD CONSTRAINT "TopicMetric_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AssessmentResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicMetric" ADD CONSTRAINT "TopicMetric_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillMetric" ADD CONSTRAINT "SkillMetric_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AssessmentResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CognitiveMetric" ADD CONSTRAINT "CognitiveMetric_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AssessmentResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTypeMetric" ADD CONSTRAINT "QuestionTypeMetric_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AssessmentResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentMetric" ADD CONSTRAINT "AssessmentMetric_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionMetric" ADD CONSTRAINT "QuestionMetric_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIInsight" ADD CONSTRAINT "AIInsight_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AssessmentResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AssessmentResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AssessmentResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_overriddenById_fkey" FOREIGN KEY ("overriddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLearningProfile" ADD CONSTRAINT "StudentLearningProfile_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentEvent" ADD CONSTRAINT "AssessmentEvent_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentEvent" ADD CONSTRAINT "AssessmentEvent_studentAssessmentId_fkey" FOREIGN KEY ("studentAssessmentId") REFERENCES "StudentAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentEvent" ADD CONSTRAINT "AssessmentEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
