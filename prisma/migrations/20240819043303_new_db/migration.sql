/*
  Warnings:

  - Made the column `picture` on table `Contact` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Contact" ALTER COLUMN "picture" SET NOT NULL,
ALTER COLUMN "picture" SET DEFAULT '/default.png';

-- CreateTable
CREATE TABLE "SensorLog" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Current" DOUBLE PRECISION NOT NULL,
    "Pressure" DOUBLE PRECISION NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SensorLog_pkey" PRIMARY KEY ("id")
);
