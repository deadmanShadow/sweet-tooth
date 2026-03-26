-- AlterTable
ALTER TABLE "Cake" ADD COLUMN     "availability" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "flavor" TEXT,
ADD COLUMN     "pounds" DOUBLE PRECISION,
ADD COLUMN     "sizeOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialFeatures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "type" TEXT;
