-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'RESTRICTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('STARTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RoleScopeType" AS ENUM ('GLOBAL', 'JURISDICTION', 'INVESTIGATION', 'CAMPAIGN');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('OFFICIAL_RECORD', 'COURT_FILING', 'MEETING_RECORD', 'NEWS_REPORT', 'ACADEMIC_STUDY', 'DATASET', 'OFFICIAL_STATEMENT', 'PUBLIC_WEBPAGE', 'FOIA_PRODUCTION', 'OTHER');

-- CreateEnum
CREATE TYPE "SourceQuality" AS ENUM ('PRIMARY_OFFICIAL', 'SECONDARY_RELIABLE', 'UNVERIFIED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PromiseStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PARTIALLY_COMPLETED', 'COMPLETED', 'BLOCKED', 'REVERSED', 'BROKEN', 'CANNOT_BE_VERIFIED', 'NO_LONGER_APPLICABLE');

-- CreateEnum
CREATE TYPE "CaseVisibility" AS ENUM ('PUBLIC', 'PARTIALLY_PUBLIC', 'RESTRICTED', 'SEALED', 'EXPUNGED', 'ARCHIVED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('OBSERVATION', 'ALLEGATION', 'OFFICIAL_STATEMENT', 'STATISTICAL_CLAIM', 'LEGAL_CLAIM', 'FINANCIAL_CLAIM', 'PROMISE', 'PREDICTION', 'OPINION', 'CONCLUSION', 'CORRECTION');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'AUTO_CHECK', 'NEEDS_EVIDENCE', 'IN_RESEARCH_REVIEW', 'IN_LEGAL_REVIEW', 'AWAITING_OFFICIAL_RESPONSE', 'PUBLISHED', 'RETURNED', 'RESTRICTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConfidenceLabel" AS ENUM ('VERIFIED', 'STRONGLY_SUPPORTED', 'PARTIALLY_SUPPORTED', 'UNCLEAR', 'DISPUTED', 'UNSUPPORTED', 'MISLEADING', 'FALSE', 'OUTDATED', 'CANNOT_BE_VERIFIED');

-- CreateEnum
CREATE TYPE "ContentVisibility" AS ENUM ('PUBLIC', 'REGISTERED', 'VERIFIED_RESEARCHERS', 'INVESTIGATION_TEAM', 'MODERATOR_ONLY', 'LEGAL_REVIEW_ONLY', 'OWNER_ONLY', 'SEALED');

-- CreateEnum
CREATE TYPE "RedactionStatus" AS ENUM ('NONE', 'NEEDED', 'IN_PROGRESS', 'REDACTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "EvidenceRelationship" AS ENUM ('SUPPORTS', 'PARTIALLY_SUPPORTS', 'CONTRADICTS', 'PROVIDES_CONTEXT', 'IRRELEVANT', 'INCONCLUSIVE');

-- CreateEnum
CREATE TYPE "RecordsRequestStatus" AS ENUM ('DRAFT', 'READY_TO_SEND', 'SENT', 'ACKNOWLEDGED', 'CLARIFICATION_REQUESTED', 'FEE_ESTIMATE_RECEIVED', 'PAYMENT_NEEDED', 'PROCESSING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'DENIED', 'APPEALED', 'CLOSED', 'OVERDUE', 'LITIGATION_REVIEW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT,
    "externalAuthId" TEXT,
    "displayName" TEXT NOT NULL,
    "publicAlias" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "mfaSecret" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "biography" TEXT,
    "homeJurisdictionId" TEXT,
    "publicLocationLevel" TEXT NOT NULL DEFAULT 'none',
    "profileImageUrl" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notificationPreferences" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "IdentityVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verificationType" TEXT NOT NULL,
    "provider" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'STARTED',
    "verifiedName" TEXT,
    "verifiedJurisdiction" TEXT,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "encryptedReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdentityVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "scopeType" "RoleScopeType" NOT NULL DEFAULT 'GLOBAL',
    "scopeId" TEXT,
    "grantedBy" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "deviceId" TEXT,
    "ipHash" TEXT,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jurisdiction" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "stateCode" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'US',
    "boundaryReference" TEXT,
    "officialWebsite" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jurisdiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovernmentBody" (
    "id" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "officialWebsite" TEXT,

    CONSTRAINT "GovernmentBody_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "governmentBodyId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "officialWebsite" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Office" (
    "id" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "agencyId" TEXT,
    "title" TEXT NOT NULL,
    "officeType" TEXT NOT NULL,
    "electedOrAppointed" TEXT NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirthPublic" TIMESTAMP(3),
    "biography" TEXT,
    "publicSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeTerm" (
    "id" TEXT NOT NULL,
    "officeId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "appointmentSource" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "OfficeTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL,
    "quality" "SourceQuality" NOT NULL DEFAULT 'UNVERIFIED',
    "publisher" TEXT,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3),
    "retrievedAt" TIMESTAMP(3),
    "description" TEXT,
    "evidenceId" TEXT,
    "addedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "locator" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Citation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promise" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "officeTermId" TEXT,
    "text" TEXT NOT NULL,
    "category" TEXT,
    "madeAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "status" "PromiseStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "confidence" TEXT NOT NULL DEFAULT 'unclear',
    "lastReviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measure" (
    "id" TEXT NOT NULL,
    "governmentBodyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "officialNumber" TEXT,
    "summary" TEXT,
    "introducedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "status" TEXT,
    "financialImpact" DECIMAL(65,30),

    CONSTRAINT "Measure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "measureId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "voteValue" TEXT NOT NULL,
    "voteDate" TIMESTAMP(3),

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialStatement" (
    "id" TEXT NOT NULL,
    "personId" TEXT,
    "agencyId" TEXT,
    "text" TEXT NOT NULL,
    "statementDate" TIMESTAMP(3),
    "statementType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficialStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conflict" (
    "id" TEXT NOT NULL,
    "personId" TEXT,
    "agencyId" TEXT,
    "conflictType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disclosed',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conflict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "complaintType" TEXT NOT NULL,
    "filedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'filed',
    "disposition" TEXT,
    "publicSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court" (
    "id" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courtType" TEXT,
    "level" TEXT,
    "officialWebsite" TEXT,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Judge" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "selectionMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "Judge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProsecutorOffice" (
    "id" TEXT NOT NULL,
    "jurisdictionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialWebsite" TEXT,

    CONSTRAINT "ProsecutorOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prosecutor" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "prosecutorOfficeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "Prosecutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "caseType" TEXT,
    "filedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "status" TEXT,
    "publicTitle" TEXT,
    "visibility" "CaseVisibility" NOT NULL DEFAULT 'PUBLIC',
    "sealingStatus" TEXT,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseParty" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "personOrOrgType" TEXT NOT NULL,
    "personOrOrgId" TEXT,
    "role" TEXT NOT NULL,
    "publicName" TEXT,
    "protected" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CaseParty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventAt" TIMESTAMP(3),
    "officialText" TEXT,
    "plainSummary" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "visibility" "CaseVisibility" NOT NULL DEFAULT 'PUBLIC',
    "redactionStatus" TEXT NOT NULL DEFAULT 'none',
    "addedByUserId" TEXT,
    "reviewedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charge" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "statute" TEXT,
    "description" TEXT,
    "level" TEXT,
    "filedAt" TIMESTAMP(3),
    "outcome" TEXT,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseOutcome" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "outcomeType" TEXT NOT NULL,
    "outcomeDate" TIMESTAMP(3),
    "sentence" TEXT,
    "disposition" TEXT,

    CONSTRAINT "CaseOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "submitterUserId" TEXT NOT NULL,
    "claimType" "ClaimType" NOT NULL,
    "text" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "occurredAt" TIMESTAMP(3),
    "jurisdictionId" TEXT,
    "topic" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "confidenceLabel" "ConfidenceLabel" NOT NULL DEFAULT 'UNCLEAR',
    "visibility" "ContentVisibility" NOT NULL DEFAULT 'OWNER_ONLY',
    "seriousAllegation" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "officialResponseStatus" TEXT NOT NULL DEFAULT 'none',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimReview" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "reviewerUserId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceItem" (
    "id" TEXT NOT NULL,
    "uploaderUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "evidenceType" TEXT NOT NULL,
    "originalStorageKey" TEXT NOT NULL,
    "publicStorageKey" TEXT,
    "originalHash" TEXT,
    "processedHash" TEXT,
    "visibility" "ContentVisibility" NOT NULL DEFAULT 'OWNER_ONLY',
    "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
    "redactionStatus" "RedactionStatus" NOT NULL DEFAULT 'NONE',
    "legalHold" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceMetadata" (
    "evidenceId" TEXT NOT NULL,
    "sourceName" TEXT,
    "sourceType" TEXT,
    "sourceDate" TIMESTAMP(3),
    "custodian" TEXT,
    "originalFilename" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "extractedText" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "EvidenceMetadata_pkey" PRIMARY KEY ("evidenceId")
);

-- CreateTable
CREATE TABLE "ClaimEvidenceLink" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "relationship" "EvidenceRelationship" NOT NULL,
    "strength" TEXT NOT NULL DEFAULT 'unclear',
    "reviewerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimEvidenceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceChainEvent" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorUserId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "EvidenceChainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redaction" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "redactedCopyKey" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "redactedBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficialResponse" (
    "id" TEXT NOT NULL,
    "claimId" TEXT,
    "responderUserId" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "responseType" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfficialResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Correction" (
    "id" TEXT NOT NULL,
    "claimId" TEXT,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "correctedBy" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Correction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardMethodology" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "publicDocumentUrl" TEXT,

    CONSTRAINT "ScorecardMethodology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scorecard" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "methodologyId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "overallScore" DECIMAL(65,30),
    "confidence" TEXT NOT NULL DEFAULT 'insufficient_data',
    "insufficientData" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scorecard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardCategory" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "score" DECIMAL(65,30),
    "weight" DECIMAL(65,30) NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'insufficient_data',
    "explanation" TEXT,

    CONSTRAINT "ScorecardCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardMetric" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "rawValue" DECIMAL(65,30),
    "normalizedScore" DECIMAL(65,30),
    "weight" DECIMAL(65,30) NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'insufficient_data',

    CONSTRAINT "ScorecardMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScorecardAppeal" (
    "id" TEXT NOT NULL,
    "scorecardId" TEXT NOT NULL,
    "appellantUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "evidenceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "decision" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScorecardAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordsRequest" (
    "id" TEXT NOT NULL,
    "creatorUserId" TEXT NOT NULL,
    "agencyId" TEXT,
    "jurisdictionId" TEXT,
    "title" TEXT NOT NULL,
    "requestText" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "status" "RecordsRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "feeLimit" DECIMAL(65,30),
    "feeEstimate" DECIMAL(65,30),
    "dueDate" TIMESTAMP(3),
    "public" BOOLEAN NOT NULL DEFAULT false,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordsRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordsRequestEvent" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "RecordsRequestEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordsProduction" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "evidenceId" TEXT,
    "receivedAt" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "RecordsProduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordsDenial" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "exemption" TEXT,
    "denialDate" TIMESTAMP(3),
    "appealStatus" TEXT,

    CONSTRAINT "RecordsDenial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReport" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAction" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "moderatorUserId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "publicExplanation" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "ModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationAppeal" (
    "id" TEXT NOT NULL,
    "moderationActionId" TEXT NOT NULL,
    "appellantUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'submitted',
    "reviewedBy" TEXT,
    "decision" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReputationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "sourceType" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotRiskEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "deviceId" TEXT,
    "riskType" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotRiskEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "linkPath" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_externalAuthId_key" ON "User"("externalAuthId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "IdentityVerification_userId_idx" ON "IdentityVerification"("userId");

-- CreateIndex
CREATE INDEX "IdentityVerification_status_idx" ON "IdentityVerification"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "UserRole_userId_idx" ON "UserRole"("userId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_scopeType_scopeId_key" ON "UserRole"("userId", "roleId", "scopeType", "scopeId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Jurisdiction_parentId_idx" ON "Jurisdiction"("parentId");

-- CreateIndex
CREATE INDEX "Jurisdiction_type_idx" ON "Jurisdiction"("type");

-- CreateIndex
CREATE INDEX "GovernmentBody_jurisdictionId_idx" ON "GovernmentBody"("jurisdictionId");

-- CreateIndex
CREATE INDEX "Agency_jurisdictionId_idx" ON "Agency"("jurisdictionId");

-- CreateIndex
CREATE INDEX "Office_jurisdictionId_idx" ON "Office"("jurisdictionId");

-- CreateIndex
CREATE INDEX "OfficeTerm_officeId_idx" ON "OfficeTerm"("officeId");

-- CreateIndex
CREATE INDEX "OfficeTerm_personId_idx" ON "OfficeTerm"("personId");

-- CreateIndex
CREATE INDEX "Source_sourceType_idx" ON "Source"("sourceType");

-- CreateIndex
CREATE INDEX "Citation_subjectType_subjectId_idx" ON "Citation"("subjectType", "subjectId");

-- CreateIndex
CREATE INDEX "Citation_sourceId_idx" ON "Citation"("sourceId");

-- CreateIndex
CREATE INDEX "Promise_personId_idx" ON "Promise"("personId");

-- CreateIndex
CREATE INDEX "Measure_governmentBodyId_idx" ON "Measure"("governmentBodyId");

-- CreateIndex
CREATE INDEX "Vote_measureId_idx" ON "Vote"("measureId");

-- CreateIndex
CREATE INDEX "Vote_personId_idx" ON "Vote"("personId");

-- CreateIndex
CREATE INDEX "Complaint_targetType_targetId_idx" ON "Complaint"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Case_courtId_idx" ON "Case"("courtId");

-- CreateIndex
CREATE INDEX "CaseEvent_caseId_idx" ON "CaseEvent"("caseId");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_targetType_targetId_idx" ON "Claim"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "Claim_jurisdictionId_idx" ON "Claim"("jurisdictionId");

-- CreateIndex
CREATE INDEX "ClaimReview_claimId_idx" ON "ClaimReview"("claimId");

-- CreateIndex
CREATE INDEX "EvidenceItem_uploaderUserId_idx" ON "EvidenceItem"("uploaderUserId");

-- CreateIndex
CREATE INDEX "EvidenceItem_visibility_idx" ON "EvidenceItem"("visibility");

-- CreateIndex
CREATE INDEX "ClaimEvidenceLink_evidenceId_idx" ON "ClaimEvidenceLink"("evidenceId");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimEvidenceLink_claimId_evidenceId_key" ON "ClaimEvidenceLink"("claimId", "evidenceId");

-- CreateIndex
CREATE INDEX "EvidenceChainEvent_evidenceId_idx" ON "EvidenceChainEvent"("evidenceId");

-- CreateIndex
CREATE INDEX "Redaction_evidenceId_idx" ON "Redaction"("evidenceId");

-- CreateIndex
CREATE INDEX "OfficialResponse_subjectType_subjectId_idx" ON "OfficialResponse"("subjectType", "subjectId");

-- CreateIndex
CREATE INDEX "Correction_subjectType_subjectId_idx" ON "Correction"("subjectType", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardMethodology_name_version_key" ON "ScorecardMethodology"("name", "version");

-- CreateIndex
CREATE INDEX "Scorecard_entityType_entityId_idx" ON "Scorecard"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ScorecardAppeal_scorecardId_idx" ON "ScorecardAppeal"("scorecardId");

-- CreateIndex
CREATE INDEX "RecordsRequest_creatorUserId_idx" ON "RecordsRequest"("creatorUserId");

-- CreateIndex
CREATE INDEX "RecordsRequest_status_idx" ON "RecordsRequest"("status");

-- CreateIndex
CREATE INDEX "ContentReport_contentType_contentId_idx" ON "ContentReport"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "ContentReport_status_idx" ON "ContentReport"("status");

-- CreateIndex
CREATE INDEX "ModerationAction_contentType_contentId_idx" ON "ModerationAction"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "ModerationAppeal_moderationActionId_idx" ON "ModerationAppeal"("moderationActionId");

-- CreateIndex
CREATE INDEX "ReputationEvent_userId_idx" ON "ReputationEvent"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Follow_targetType_targetId_idx" ON "Follow"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_userId_targetType_targetId_key" ON "Follow"("userId", "targetType", "targetId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_homeJurisdictionId_fkey" FOREIGN KEY ("homeJurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdentityVerification" ADD CONSTRAINT "IdentityVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jurisdiction" ADD CONSTRAINT "Jurisdiction_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Jurisdiction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GovernmentBody" ADD CONSTRAINT "GovernmentBody_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeTerm" ADD CONSTRAINT "OfficeTerm_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeTerm" ADD CONSTRAINT "OfficeTerm_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Citation" ADD CONSTRAINT "Citation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promise" ADD CONSTRAINT "Promise_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promise" ADD CONSTRAINT "Promise_officeTermId_fkey" FOREIGN KEY ("officeTermId") REFERENCES "OfficeTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measure" ADD CONSTRAINT "Measure_governmentBodyId_fkey" FOREIGN KEY ("governmentBodyId") REFERENCES "GovernmentBody"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialStatement" ADD CONSTRAINT "OfficialStatement_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conflict" ADD CONSTRAINT "Conflict_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_jurisdictionId_fkey" FOREIGN KEY ("jurisdictionId") REFERENCES "Jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Judge" ADD CONSTRAINT "Judge_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Judge" ADD CONSTRAINT "Judge_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prosecutor" ADD CONSTRAINT "Prosecutor_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prosecutor" ADD CONSTRAINT "Prosecutor_prosecutorOfficeId_fkey" FOREIGN KEY ("prosecutorOfficeId") REFERENCES "ProsecutorOffice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseParty" ADD CONSTRAINT "CaseParty_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseEvent" ADD CONSTRAINT "CaseEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Charge" ADD CONSTRAINT "Charge_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseOutcome" ADD CONSTRAINT "CaseOutcome_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimReview" ADD CONSTRAINT "ClaimReview_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceMetadata" ADD CONSTRAINT "EvidenceMetadata_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimEvidenceLink" ADD CONSTRAINT "ClaimEvidenceLink_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimEvidenceLink" ADD CONSTRAINT "ClaimEvidenceLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceChainEvent" ADD CONSTRAINT "EvidenceChainEvent_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redaction" ADD CONSTRAINT "Redaction_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "EvidenceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialResponse" ADD CONSTRAINT "OfficialResponse_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Correction" ADD CONSTRAINT "Correction_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_methodologyId_fkey" FOREIGN KEY ("methodologyId") REFERENCES "ScorecardMethodology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardCategory" ADD CONSTRAINT "ScorecardCategory_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "Scorecard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardMetric" ADD CONSTRAINT "ScorecardMetric_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ScorecardCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScorecardAppeal" ADD CONSTRAINT "ScorecardAppeal_scorecardId_fkey" FOREIGN KEY ("scorecardId") REFERENCES "Scorecard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordsRequestEvent" ADD CONSTRAINT "RecordsRequestEvent_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RecordsRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordsProduction" ADD CONSTRAINT "RecordsProduction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RecordsRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordsDenial" ADD CONSTRAINT "RecordsDenial_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RecordsRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationAppeal" ADD CONSTRAINT "ModerationAppeal_moderationActionId_fkey" FOREIGN KEY ("moderationActionId") REFERENCES "ModerationAction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReputationEvent" ADD CONSTRAINT "ReputationEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
