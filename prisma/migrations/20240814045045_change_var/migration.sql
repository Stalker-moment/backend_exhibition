/*
  Warnings:

  - You are about to drop the column `timestamp` on the `DataPlc` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `DataPlc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataPlc" DROP COLUMN "timestamp",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
