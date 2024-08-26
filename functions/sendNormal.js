const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendNormal() {
  try {
    // Get maxCurrent and maxPressure from configuration
    const getConfiguration = await prisma.oeeConfig.findFirst();
    const maxCurrent = getConfiguration.maxCurrent;
    const maxPressure = getConfiguration.maxPressure;

    return { maxCurrent, maxPressure };
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendNormal;
