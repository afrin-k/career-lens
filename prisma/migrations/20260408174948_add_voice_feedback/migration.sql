/*
  Warnings:

  - You are about to drop the column `categoryScores` on the `VoiceInterview` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `VoiceInterview` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `VoiceInterview` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VoiceInterview" DROP COLUMN "categoryScores",
DROP COLUMN "feedback",
DROP COLUMN "score",
ADD COLUMN     "finalized" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'STARTED';

-- CreateTable
CREATE TABLE "VoiceFeedback" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "categoryScores" JSONB[],
    "strengths" TEXT[],
    "areasForImprovement" TEXT[],
    "finalAssessment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceFeedback_interviewId_key" ON "VoiceFeedback"("interviewId");

-- AddForeignKey
ALTER TABLE "VoiceFeedback" ADD CONSTRAINT "VoiceFeedback_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "VoiceInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
