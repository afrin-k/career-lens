-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('STARTED', 'COMPLETED', 'FAILED');

-- DropIndex
DROP INDEX "CoverLetter_userId_key";

-- CreateTable
CREATE TABLE "VoiceInterview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "techstack" TEXT[],
    "type" TEXT NOT NULL,
    "questions" TEXT[],
    "transcript" JSONB[],
    "feedback" TEXT,
    "score" DOUBLE PRECISION,
    "categoryScores" JSONB,
    "status" "InterviewStatus" NOT NULL DEFAULT 'COMPLETED',
    "coverImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceInterview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoiceInterview_userId_idx" ON "VoiceInterview"("userId");

-- AddForeignKey
ALTER TABLE "VoiceInterview" ADD CONSTRAINT "VoiceInterview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
