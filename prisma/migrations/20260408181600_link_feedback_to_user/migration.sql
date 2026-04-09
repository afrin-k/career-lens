-- CreateIndex
CREATE INDEX "VoiceFeedback_userId_idx" ON "VoiceFeedback"("userId");

-- AddForeignKey
ALTER TABLE "VoiceFeedback" ADD CONSTRAINT "VoiceFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
