/*
  Warnings:

  - You are about to drop the column `Running` on the `DataPlc` table. All the data in the column will be lost.
  - Added the required column `DownTime` to the `DataPlc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DataPlc" DROP COLUMN "Running",
ADD COLUMN     "DownTime" BOOLEAN NOT NULL;
