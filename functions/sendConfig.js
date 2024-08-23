const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendConfig() {
  try {
    // Fetch the most recent log entry
    let latestConfig = await prisma.oeeConfig.findFirst({
      orderBy: {
        id: "desc",
      },
    });

    // Check if a log entry exists
    if (!latestConfig) {
      return { message: "No found" };
    }

    //hitung target total time
    let targetCycleTimeOK = latestConfig.targetCycleTimeOK;
    let totalProduction = latestConfig.targetProduction;
    let idNow = latestConfig.idNow;

    let targetTotalTime = targetCycleTimeOK * totalProduction;

    //convert seconds to HH:MM:SS
    let hours = Math.floor(targetTotalTime / 3600);
    let minutes = Math.floor((targetTotalTime % 3600) / 60);
    let seconds = Math.floor(targetTotalTime % 60);

    let targetTotalTimeHHMMSS = `${hours}:${minutes}:${seconds}`;

    //result
    let result = {
      idNow: idNow,
      targetCycleTime: targetCycleTimeOK,
      targetProduction: totalProduction,
      targetTotalTimeHHMMSS: targetTotalTimeHHMMSS,
      maxCurrent: latestConfig.maxCurrent,
      maxPressure: latestConfig.maxPressure,
    };

    return result;
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendConfig;
