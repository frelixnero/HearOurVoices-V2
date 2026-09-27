-- CreateEnum
CREATE TYPE "CivicScope" AS ENUM ('LOCAL', 'STATE', 'NATION');

-- CreateEnum
CREATE TYPE "CivicVerdict" AS ENUM ('GOOD_MOVE', 'BAD_MOVE', 'NEEDS_INFO');

-- CreateEnum
CREATE TYPE "EvidenceLabel" AS ENUM ('DOCUMENTED', 'RECORDED', 'MISSING', 'UNVERIFIED');

-- CreateTable
CREATE TABLE "CivicNews" (
    "id" TEXT NOT NULL,
    "scope" "CivicScope" NOT NULL,
    "title" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorName" TEXT,
    "jurisdiction" TEXT,
    "whatHappened" TEXT NOT NULL,
    "whyItMatters" TEXT NOT NULL,
    "pros" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recordedVote" BOOLEAN,
    "publicNotice" BOOLEAN,
    "amendmentPosted" BOOLEAN,
    "meetingRecorded" BOOLEAN,
    "publicComment" BOOLEAN,
    "procedureLegal" BOOLEAN,
    "impactLevel" INTEGER NOT NULL DEFAULT 0,
    "goodVotes" INTEGER NOT NULL DEFAULT 0,
    "badVotes" INTEGER NOT NULL DEFAULT 0,
    "infoVotes" INTEGER NOT NULL DEFAULT 0,
    "status" "StoryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "CivicNews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CivicSource" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "label" "EvidenceLabel" NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CivicSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CivicVote" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verdict" "CivicVerdict" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CivicVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CivicNews_scope_status_publishedAt_idx" ON "CivicNews"("scope", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "CivicSource_newsId_idx" ON "CivicSource"("newsId");

-- CreateIndex
CREATE INDEX "CivicVote_newsId_idx" ON "CivicVote"("newsId");

-- CreateIndex
CREATE UNIQUE INDEX "CivicVote_newsId_userId_key" ON "CivicVote"("newsId", "userId");

-- AddForeignKey
ALTER TABLE "CivicSource" ADD CONSTRAINT "CivicSource_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "CivicNews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CivicVote" ADD CONSTRAINT "CivicVote_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "CivicNews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
