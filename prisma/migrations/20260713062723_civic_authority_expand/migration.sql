-- CreateEnum
CREATE TYPE "AuthorityCategory" AS ENUM ('POLICE', 'LAWMAKER', 'JUDGE', 'COUNCIL', 'AGENCY', 'COMMITTEE', 'OVERSIGHT', 'EXECUTIVE', 'OTHER');

-- AlterTable
ALTER TABLE "CivicNews" ADD COLUMN     "actorKey" TEXT,
ADD COLUMN     "alternatives" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "authority" "AuthorityCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "powerMap" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "CivicNews_authority_idx" ON "CivicNews"("authority");

-- CreateIndex
CREATE INDEX "CivicNews_actorKey_idx" ON "CivicNews"("actorKey");
