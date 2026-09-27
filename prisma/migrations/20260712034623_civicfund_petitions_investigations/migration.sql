-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'LIVE', 'FUNDED', 'ACTIVE', 'AWAITING_RECORDS', 'DELIVERABLE_PUBLISHED', 'PARTIALLY_COMPLETED', 'FAILED', 'REFUNDING', 'CLOSED');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "creatorUserId" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "jurisdictionId" TEXT,
    "goalAmount" DECIMAL(65,30) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedBy" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "platformFeeRate" DECIMAL(65,30) NOT NULL DEFAULT 0.05,
    "refundPolicy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignMilestone" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" DECIMAL(65,30),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CampaignMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "contributorUserId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "processorFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "platformFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'succeeded',
    "anonymousDisplay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignExpense" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "receiptEvidenceId" TEXT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "approvedBy" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignUpdate" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Petition" (
    "id" TEXT NOT NULL,
    "creatorUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "requestText" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "jurisdictionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "deadline" TIMESTAMP(3),
    "signatureGoal" INTEGER,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Petition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PetitionSignature" (
    "id" TEXT NOT NULL,
    "petitionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verifiedJurisdiction" TEXT,
    "displayPreference" TEXT NOT NULL DEFAULT 'private',
    "fraudStatus" TEXT NOT NULL DEFAULT 'clear',
    "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PetitionSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionPlan" (
    "id" TEXT NOT NULL,
    "creatorUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "jurisdictionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionStep" (
    "id" TEXT NOT NULL,
    "actionPlanId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "ActionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investigation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "researchQuestion" TEXT NOT NULL,
    "jurisdictionId" TEXT,
    "leadUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'proposal',
    "visibility" "ContentVisibility" NOT NULL DEFAULT 'INVESTIGATION_TEAM',
    "methodology" TEXT,
    "limitations" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Investigation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationMember" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "conflictDisclosure" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestigationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationTask" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignedTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "dueAt" TIMESTAMP(3),

    CONSTRAINT "InvestigationTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationFinding" (
    "id" TEXT NOT NULL,
    "investigationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'unclear',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "InvestigationFinding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Contribution_campaignId_idx" ON "Contribution"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignExpense_campaignId_idx" ON "CampaignExpense"("campaignId");

-- CreateIndex
CREATE INDEX "Petition_status_idx" ON "Petition"("status");

-- CreateIndex
CREATE INDEX "PetitionSignature_petitionId_idx" ON "PetitionSignature"("petitionId");

-- CreateIndex
CREATE UNIQUE INDEX "PetitionSignature_petitionId_userId_key" ON "PetitionSignature"("petitionId", "userId");

-- CreateIndex
CREATE INDEX "Investigation_status_idx" ON "Investigation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InvestigationMember_investigationId_userId_key" ON "InvestigationMember"("investigationId", "userId");

-- AddForeignKey
ALTER TABLE "CampaignMilestone" ADD CONSTRAINT "CampaignMilestone_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contribution" ADD CONSTRAINT "Contribution_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignExpense" ADD CONSTRAINT "CampaignExpense_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignUpdate" ADD CONSTRAINT "CampaignUpdate_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PetitionSignature" ADD CONSTRAINT "PetitionSignature_petitionId_fkey" FOREIGN KEY ("petitionId") REFERENCES "Petition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionStep" ADD CONSTRAINT "ActionStep_actionPlanId_fkey" FOREIGN KEY ("actionPlanId") REFERENCES "ActionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationMember" ADD CONSTRAINT "InvestigationMember_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationTask" ADD CONSTRAINT "InvestigationTask_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationFinding" ADD CONSTRAINT "InvestigationFinding_investigationId_fkey" FOREIGN KEY ("investigationId") REFERENCES "Investigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
