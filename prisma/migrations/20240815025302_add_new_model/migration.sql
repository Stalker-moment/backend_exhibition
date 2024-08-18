-- CreateTable
CREATE TABLE "oeeConfig" (
    "id" INTEGER NOT NULL,
    "idNow" INTEGER NOT NULL,
    "targetProduction" INTEGER NOT NULL,
    "targetCycleTimeOK" INTEGER NOT NULL,
    "targetCycleTimeNG" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oeeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oeeProcess" (
    "id" INTEGER NOT NULL,
    "idNow" INTEGER NOT NULL,
    "process" INTEGER NOT NULL,
    "isOK" BOOLEAN NOT NULL,
    "target" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oeeProcess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownTime" (
    "id" SERIAL NOT NULL,
    "idNow" INTEGER NOT NULL,
    "timeStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeEnd" TIMESTAMP(3) NOT NULL,
    "timeDown" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "DownTime_pkey" PRIMARY KEY ("id")
);
