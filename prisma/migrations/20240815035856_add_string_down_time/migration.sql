-- AlterTable
ALTER TABLE "DownTime" ADD COLUMN     "timeDownStr" TEXT,
ALTER COLUMN "timeDown" DROP NOT NULL;
