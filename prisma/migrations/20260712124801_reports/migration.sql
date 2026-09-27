-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('RUMOR', 'VERIFIED', 'OPINION', 'DEVELOPING');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PUBLISHED', 'PENDING_REVIEW', 'REMOVED');

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "byline" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "headline" TEXT NOT NULL,
    "whatWasSaid" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceKind" TEXT NOT NULL DEFAULT 'video',
    "whyImportant" TEXT NOT NULL,
    "neutralityAffirmed" BOOLEAN NOT NULL DEFAULT false,
    "neutralityFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ReportStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_status_publishedAt_idx" ON "Report"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Report_reportType_idx" ON "Report"("reportType");
