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

    // Get maxCurrent and maxPressure from configuration
    const getConfiguration = await prisma.oeeConfig.findFirst();
    const maxCurrent = getConfiguration.maxCurrent;
    const maxPressure = getConfiguration.maxPressure;

    let indexCurrent = "normal";
      if (log.Current < maxCurrent - 1) {
        indexCurrent = "low";
      } else if (log.Current > maxCurrent) {
        indexCurrent = "over";
      }

      let indexPressure = "normal";
      if (log.Pressure < maxPressure - 1) {
        indexPressure = "low";
      } else if (log.Pressure > maxPressure) {
        indexPressure = "over";
      }

    latestConfig = {
      Current: latestConfig.Current,
      UnitCurrent: "A",
      Pressure: latestConfig.Pressure,
      UnitPressure: "bar",
      indexCurrent: indexCurrent,
      indexPressure: indexPressure,
      updateAt: latestConfig.updateAt,
    };

    return latestConfig; // Return the latest log entry
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendSensor;
