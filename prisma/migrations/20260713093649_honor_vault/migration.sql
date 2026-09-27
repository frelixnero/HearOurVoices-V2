-- CreateEnum
CREATE TYPE "HonorCategory" AS ENUM ('FALLEN', 'COMBAT', 'LIFESAVING', 'COMMUNITY', 'LEGACY');

-- CreateTable
CREATE TABLE "HonorHero" (
    "id" TEXT NOT NULL,
    "heroName" TEXT NOT NULL,
    "rank" TEXT,
    "branch" TEXT,
    "category" "HonorCategory" NOT NULL DEFAULT 'FALLEN',
    "homeState" TEXT,
    "conflictOrEra" TEXT,
    "memoryLockPrimary" TEXT NOT NULL,
    "memoryLockSacrifice" TEXT NOT NULL,
    "serviceSummary" TEXT,
    "momentOfCourage" TEXT,
    "legacyImpact" TEXT,
    "medals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "memoryPhrases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "chainOfInfluence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "quotes" JSONB NOT NULL DEFAULT '[]',
    "keyDates" JSONB NOT NULL DEFAULT '[]',
    "honorScore" INTEGER NOT NULL DEFAULT 0,
    "spotlightLevel" INTEGER NOT NULL DEFAULT 0,
    "publishState" "StoryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "HonorHero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HonorHero_spotlightLevel_publishState_idx" ON "HonorHero"("spotlightLevel", "publishState");

-- CreateIndex
CREATE INDEX "HonorHero_category_idx" ON "HonorHero"("category");
