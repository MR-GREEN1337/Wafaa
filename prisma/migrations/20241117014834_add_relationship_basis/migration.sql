-- CreateEnum
CREATE TYPE "RelationshipBasis" AS ENUM ('ISLAMIC', 'CHRISTIAN', 'BUDDHIST', 'JEWISH', 'SECULAR', 'INTERFAITH', 'OTHER');

-- AlterTable
ALTER TABLE "Relationship" ADD COLUMN     "basis" "RelationshipBasis",
ADD COLUMN     "customBasis" TEXT,
ADD COLUMN     "religiousValues" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "religiousBelief" TEXT;
