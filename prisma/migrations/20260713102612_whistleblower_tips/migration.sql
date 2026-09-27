-- CreateEnum
CREATE TYPE "TipStatus" AS ENUM ('NEW', 'REVIEWED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "WhistleblowerTip" (
    "id" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "category" TEXT,
    "status" "TipStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhistleblowerTip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhistleblowerTip_status_createdAt_idx" ON "WhistleblowerTip"("status", "createdAt");
