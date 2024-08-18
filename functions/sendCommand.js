const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendCommand() {
  try {
    // Fetch the most recent log entry
    let latestConfig = await prisma.configuration.findFirst({
      orderBy: {
        id: "desc",
      },
    });

    // Check if a log entry exists
    if (!latestConfig) {
      throw new Error("No configuration found");
    }

    latestConfig = {
      AutoButton: latestConfig.AutoButton,
      FaultResetButton: latestConfig.FaultResetButton,
      StopButton: latestConfig.StopButton,
      MasterOnButton: latestConfig.MasterOnButton,
    };

    return latestConfig; // Return the latest log entry
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendCommand;
