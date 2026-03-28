-- CreateEnum
CREATE TYPE "OrderLocation" AS ENUM ('INSIDE', 'OUTSIDE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "location" "OrderLocation" NOT NULL DEFAULT 'INSIDE';

-- CreateTable
CREATE TABLE "CustomRequest" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "flavor" TEXT NOT NULL,
    "pounds" DOUBLE PRECISION NOT NULL,
    "size" TEXT NOT NULL,
    "features" TEXT,
    "description" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "whatsappUrl" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomRequest_status_idx" ON "CustomRequest"("status");
