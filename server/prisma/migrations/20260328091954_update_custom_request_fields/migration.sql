-- AlterTable
ALTER TABLE "CustomRequest" ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "location" "OrderLocation" NOT NULL DEFAULT 'INSIDE';
