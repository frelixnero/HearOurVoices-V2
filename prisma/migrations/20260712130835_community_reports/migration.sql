/*
  Warnings:

  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReportLane" AS ENUM ('CITIZEN', 'JOURNALIST');

-- CreateEnum
CREATE TYPE "PostLabel" AS ENUM ('OPINION', 'UNVERIFIED_TIP', 'FIRSTHAND_ACCOUNT', 'EVIDENCE_SUBMITTED', 'CORRECTION_ISSUED', 'VERIFIED_BY_RECORDS', 'DISPROVEN');

-- CreateEnum
CREATE TYPE "ReportClaimStatus" AS ENUM ('UNREVIEWED', 'UNVERIFIED', 'EVIDENCE_DEVELOPING', 'PARTIALLY_SUPPORTED', 'VERIFIED', 'DISPUTED', 'DISPROVEN', 'RETRACTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isJournalist" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Report";

-- DropEnum
DROP TYPE "ReportStatus";

-- DropEnum
DROP TYPE "ReportType";

-- CreateTable
CREATE TABLE "CommunityReport" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "lane" "ReportLane" NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT 'Anonymous',
    "anonymous" BOOLEAN NOT NULL DEFAULT true,
    "label" "PostLabel" NOT NULL DEFAULT 'UNVERIFIED_TIP',
    "claimStatus" "ReportClaimStatus" NOT NULL DEFAULT 'UNREVIEWED',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "topic" TEXT,
    "sourceUrl" TEXT,
    "exactClaim" TEXT,
    "videoShows" TEXT,
    "videoDoesntProve" TEXT,
    "confirmedParts" TEXT,
    "origin" TEXT,
    "whyImportant" TEXT,
    "affectedParty" TEXT,
    "affectedResponse" TEXT,
    "conflicts" TEXT,
    "neutralityFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "StoryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityReportCorrection" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "correctedBy" TEXT NOT NULL,
    "voluntary" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityReportCorrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimStatusEvent" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "fromStatus" "ReportClaimStatus" NOT NULL,
    "toStatus" "ReportClaimStatus" NOT NULL,
    "rationale" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityReport_lane_status_publishedAt_idx" ON "CommunityReport"("lane", "status", "publishedAt");

-- CreateIndex
CREATE INDEX "CommunityReport_authorUserId_idx" ON "CommunityReport"("authorUserId");

-- CreateIndex
CREATE INDEX "CommunityReport_claimStatus_idx" ON "CommunityReport"("claimStatus");

-- CreateIndex
CREATE INDEX "CommunityReportCorrection_reportId_idx" ON "CommunityReportCorrection"("reportId");

-- CreateIndex
CREATE INDEX "ClaimStatusEvent_reportId_idx" ON "ClaimStatusEvent"("reportId");

-- AddForeignKey
ALTER TABLE "CommunityReportCorrection" ADD CONSTRAINT "CommunityReportCorrection_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CommunityReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimStatusEvent" ADD CONSTRAINT "ClaimStatusEvent_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "CommunityReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
