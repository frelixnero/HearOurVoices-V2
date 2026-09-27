-- CreateEnum
CREATE TYPE "AccuracyGrade" AS ENUM ('TRUE', 'MOSTLY_TRUE', 'MIXED', 'UNVERIFIED', 'MOSTLY_FALSE', 'FALSE');

-- CreateEnum
CREATE TYPE "RumorStatus" AS ENUM ('OPEN', 'PENDING_REVIEW', 'REMOVED');

-- CreateTable
CREATE TABLE "Rumor" (
    "id" TEXT NOT NULL,
    "submitterUserId" TEXT,
    "displayName" TEXT NOT NULL DEFAULT 'Anonymous',
    "anonymous" BOOLEAN NOT NULL DEFAULT true,
    "text" TEXT NOT NULL,
    "topic" TEXT,
    "status" "RumorStatus" NOT NULL DEFAULT 'OPEN',
    "accurateVotes" INTEGER NOT NULL DEFAULT 0,
    "inaccurateVotes" INTEGER NOT NULL DEFAULT 0,
    "officialGrade" "AccuracyGrade",
    "officialRationale" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rumor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RumorVote" (
    "id" TEXT NOT NULL,
    "rumorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vote" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RumorVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RumorEvidence" (
    "id" TEXT NOT NULL,
    "rumorId" TEXT NOT NULL,
    "userId" TEXT,
    "displayName" TEXT NOT NULL DEFAULT 'Anonymous',
    "anonymous" BOOLEAN NOT NULL DEFAULT true,
    "stance" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RumorEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Rumor_status_createdAt_idx" ON "Rumor"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RumorVote_rumorId_idx" ON "RumorVote"("rumorId");

-- CreateIndex
CREATE UNIQUE INDEX "RumorVote_rumorId_userId_key" ON "RumorVote"("rumorId", "userId");

-- CreateIndex
CREATE INDEX "RumorEvidence_rumorId_idx" ON "RumorEvidence"("rumorId");

-- AddForeignKey
ALTER TABLE "RumorVote" ADD CONSTRAINT "RumorVote_rumorId_fkey" FOREIGN KEY ("rumorId") REFERENCES "Rumor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RumorEvidence" ADD CONSTRAINT "RumorEvidence_rumorId_fkey" FOREIGN KEY ("rumorId") REFERENCES "Rumor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
