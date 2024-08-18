/*
  Warnings:

  - Added the required column `onDownTime` to the `oeeConfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DownTime" ALTER COLUMN "timeEnd" DROP NOT NULL,
ALTER COLUMN "timeDown" DROP NOT NULL;

-- AlterTable
ALTER TABLE "oeeConfig" ADD COLUMN     "onDownTime" BOOLEAN NOT NULL;
