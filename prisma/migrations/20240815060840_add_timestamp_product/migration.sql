/*
  Warnings:

  - You are about to drop the column `timestamp` on the `oeeProcess` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `oeeProcess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processTime` to the `oeeProcess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `oeeProcess` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `oeeProcess` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "oeeProcess" DROP COLUMN "timestamp",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "processTime" INTEGER NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
