-- CreateEnum
CREATE TYPE "StoryStatus" AS ENUM ('PUBLISHED', 'PENDING_REVIEW', 'REMOVED');

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "authorUserId" TEXT,
    "displayName" TEXT NOT NULL DEFAULT 'Anonymous',
    "anonymous" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hideLocation" BOOLEAN NOT NULL DEFAULT true,
    "status" "StoryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "supportCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorySupport" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorySupport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryComment" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "displayName" TEXT NOT NULL DEFAULT 'Anonymous',
    "anonymous" BOOLEAN NOT NULL DEFAULT true,
    "body" TEXT NOT NULL,
    "status" "StoryStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoryComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportResource" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT,
    "url" TEXT,
    "region" TEXT DEFAULT 'US',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SupportResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Story_status_publishedAt_idx" ON "Story"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Story_authorUserId_idx" ON "Story"("authorUserId");

-- CreateIndex
CREATE INDEX "StorySupport_storyId_idx" ON "StorySupport"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "StorySupport_storyId_userId_key" ON "StorySupport"("storyId", "userId");

-- CreateIndex
CREATE INDEX "StoryComment_storyId_idx" ON "StoryComment"("storyId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- AddForeignKey
ALTER TABLE "StorySupport" ADD CONSTRAINT "StorySupport_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryComment" ADD CONSTRAINT "StoryComment_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
