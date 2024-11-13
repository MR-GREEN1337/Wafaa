-- AlterTable
ALTER TABLE "User" ADD COLUMN     "attachmentStyle" TEXT,
ADD COLUMN     "communicationStyle" TEXT,
ADD COLUMN     "conflictStyle" TEXT,
ADD COLUMN     "coreValues" TEXT[],
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "loveLanguages" TEXT[],
ADD COLUMN     "personalityType" TEXT,
ADD COLUMN     "stressors" TEXT[];
