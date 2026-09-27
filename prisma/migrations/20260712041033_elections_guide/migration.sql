-- CreateTable
CREATE TABLE "Election" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jurisdictionId" TEXT,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Election_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party" TEXT,
    "incumbent" BOOLEAN NOT NULL DEFAULT false,
    "website" TEXT,
    "bio" TEXT,
    "photoGradient" TEXT NOT NULL DEFAULT 'linear-gradient(135deg,#123f52,#1e6d78)',

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidatePosition" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "stance" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceUrl" TEXT,

    CONSTRAINT "CandidatePosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateProsCon" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "CandidateProsCon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Election_status_idx" ON "Election"("status");

-- CreateIndex
CREATE INDEX "Election_electionDate_idx" ON "Election"("electionDate");

-- AddForeignKey
ALTER TABLE "Race" ADD CONSTRAINT "Race_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatePosition" ADD CONSTRAINT "CandidatePosition_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateProsCon" ADD CONSTRAINT "CandidateProsCon_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
