/*
  Warnings:

  - You are about to drop the column `CycleTimeOver` on the `DataPlc` table. All the data in the column will be lost.
  - You are about to drop the column `PLCBattAlarm` on the `DataPlc` table. All the data in the column will be lost.
  - You are about to drop the column `PartJudgmentFault` on the `DataPlc` table. All the data in the column will be lost.
  - You are about to drop the column `Plc_Running` on the `DataPlc` table. All the data in the column will be lost.
  - Added the required column `AutoButton` to the `Configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `FaultResetButton` to the `Configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MasterOnButton` to the `Configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `StopButton` to the `Configuration` table without a default value. This is not possible if the table is not empty.
  - Added the required column `L30Parts` to the `DataPlc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `L40Parts` to the `DataPlc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `MasterOn` to the `DataPlc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `PLCRun` to the `DataPlc` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Running` to the `DataPlc` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Configuration" ADD COLUMN     "AutoButton" BOOLEAN NOT NULL,
ADD COLUMN     "FaultResetButton" BOOLEAN NOT NULL,
ADD COLUMN     "MasterOnButton" BOOLEAN NOT NULL,
ADD COLUMN     "StopButton" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "DataPlc" DROP COLUMN "CycleTimeOver",
DROP COLUMN "PLCBattAlarm",
DROP COLUMN "PartJudgmentFault",
DROP COLUMN "Plc_Running",
ADD COLUMN     "L30Parts" BOOLEAN NOT NULL,
ADD COLUMN     "L40Parts" BOOLEAN NOT NULL,
ADD COLUMN     "MasterOn" BOOLEAN NOT NULL,
ADD COLUMN     "PLCRun" BOOLEAN NOT NULL,
ADD COLUMN     "Running" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "Sensor" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Current" DOUBLE PRECISION NOT NULL,
    "Pressure" DOUBLE PRECISION NOT NULL,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);
