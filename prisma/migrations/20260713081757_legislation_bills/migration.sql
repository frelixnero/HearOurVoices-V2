-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "openstatesId" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "session" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "classification" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latestActionDate" TEXT,
    "latestActionDescription" TEXT,
    "sponsors" JSONB NOT NULL DEFAULT '[]',
    "actions" JSONB NOT NULL DEFAULT '[]',
    "votes" JSONB NOT NULL DEFAULT '[]',
    "sources" JSONB NOT NULL DEFAULT '[]',
    "openstatesUrl" TEXT,
    "redFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "firstSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bill_openstatesId_key" ON "Bill"("openstatesId");

-- CreateIndex
CREATE INDEX "Bill_jurisdiction_session_idx" ON "Bill"("jurisdiction", "session");

-- CreateIndex
CREATE INDEX "Bill_lastSyncedAt_idx" ON "Bill"("lastSyncedAt");
