-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('ACTIVE', 'UNDER_REVIEW', 'HISTORICAL');

-- CreateTable
CREATE TABLE "JusticeCase" (
    "id" TEXT NOT NULL,
    "victimName" TEXT NOT NULL,
    "victimAge" INTEGER,
    "location" TEXT,
    "dateOfIncident" TIMESTAMP(3),
    "caseType" TEXT NOT NULL,
    "memoryLockPrimary" TEXT NOT NULL,
    "memoryLockFailure" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "justiceGapScore" INTEGER NOT NULL DEFAULT 0,
    "spotlightLevel" INTEGER NOT NULL DEFAULT 0,
    "favoriteActivities" TEXT,
    "personalityWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "whatWasLost" TEXT,
    "anchorPhrases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timeline" JSONB NOT NULL DEFAULT '[]',
    "actions" JSONB NOT NULL DEFAULT '[]',
    "questions" JSONB NOT NULL DEFAULT '[]',
    "flags" JSONB NOT NULL DEFAULT '[]',
    "sources" JSONB NOT NULL DEFAULT '[]',
    "publishState" "StoryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "JusticeCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JusticeCase_spotlightLevel_publishState_idx" ON "JusticeCase"("spotlightLevel", "publishState");

-- CreateIndex
CREATE INDEX "JusticeCase_status_idx" ON "JusticeCase"("status");
