-- AlterTable
ALTER TABLE "HonorHero" ADD COLUMN     "candles" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "HonorTribute" (
    "id" TEXT NOT NULL,
    "heroId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT 'Anonymous',
    "relationship" TEXT,
    "message" TEXT NOT NULL,
    "status" "StoryStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "HonorTribute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HonorTribute_heroId_status_idx" ON "HonorTribute"("heroId", "status");

-- CreateIndex
CREATE INDEX "HonorTribute_status_createdAt_idx" ON "HonorTribute"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "HonorTribute" ADD CONSTRAINT "HonorTribute_heroId_fkey" FOREIGN KEY ("heroId") REFERENCES "HonorHero"("id") ON DELETE CASCADE ON UPDATE CASCADE;
