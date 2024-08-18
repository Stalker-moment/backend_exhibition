/*
  Warnings:

  - Added the required column `timeDown` to the `DownTime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DownTime" DROP COLUMN "timeDown",
ADD COLUMN     "timeDown" INTEGER NOT NULL;
