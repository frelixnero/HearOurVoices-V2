-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'DISMISSED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "jurisdiction" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "citations" JSONB NOT NULL DEFAULT '[]',
    "source" TEXT NOT NULL DEFAULT 'grok',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
