-- CreateTable
CREATE TABLE "ConsolidatedAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "analysis" JSONB NOT NULL,

    CONSTRAINT "ConsolidatedAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConsolidatedAnalysis_userId_idx" ON "ConsolidatedAnalysis"("userId");
