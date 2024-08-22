const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendLamp() {
  try {
    // Fetch the most recent log entry
    let latestConfig = await prisma.dataPlc.findFirst({
      orderBy: {
        id: "desc",
      },
    });

    // Check if a log entry exists
    if (!latestConfig) {
      return { "message": "No found" };
    }

    //reverse value boolean at database :
    latestConfig.Power = !latestConfig.Power;
    latestConfig.DownTime = !latestConfig.DownTime;
    latestConfig.Air = !latestConfig.Air;
    latestConfig.MachiningComp = !latestConfig.MachiningComp;
    latestConfig.L40Parts = !latestConfig.L40Parts;
    latestConfig.L30Parts = !latestConfig.L30Parts;
    latestConfig.PLCRun = !latestConfig.PLCRun;
    latestConfig.MasterOn = !latestConfig.MasterOn;

    latestConfig = {
      Power: latestConfig.Power,
      DownTime: latestConfig.DownTime,
      Air: latestConfig.Air,
      MachiningComp: latestConfig.MachiningComp,
      L40Parts: latestConfig.L40Parts,
      L30Parts: latestConfig.L30Parts,
      PLCRun: latestConfig.PLCRun,
      MasterOn: latestConfig.MasterOn,
    };

    return latestConfig; // Return the latest log entry
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendLamp;
