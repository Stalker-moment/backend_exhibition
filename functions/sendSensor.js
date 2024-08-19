const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendSensor() {
  try {
    // Fetch the most recent log entry
    let latestConfig = await prisma.sensor.findFirst({
      orderBy: {
        id: "desc",
      },
    });

    // Check if a log entry exists
    if (!latestConfig) {
      return { message: "No found" };
    }

    latestConfig = {
      Current: latestConfig.Current,
      UnitCurrent: "A",
      Pressure: latestConfig.Pressure,
      UnitPressure: "bar",
      updateAt: latestConfig.updateAt,
    };

    return latestConfig; // Return the latest log entry
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendSensor;
