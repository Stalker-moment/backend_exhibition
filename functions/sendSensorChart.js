const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { format } = require("date-fns");

/**
 * Fetch logs filtered by today's date and format them into a specific structure.
 * @returns {Promise<Object>} - A promise that resolves to an object with TimeChart, Current, and Pressure arrays.
 */
async function sendSensorChart() {
  try {
    // Get the start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch the data for today
    const sensorLogs = await prisma.sensorLog.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Process the data
    const data = {
      TimeChart: [],
      Current: [],
      Pressure: [],
    };

    sensorLogs.forEach(log => {
      data.TimeChart.push(format(log.timestamp, 'HH:mm:ss'));
      data.Current.push(log.Current);
      data.Pressure.push(log.Pressure);
    });

    return data;

  } catch (error) {
    console.error("Error fetching sensorChart:", error);
    throw error;
  }
}

module.exports = sendSensorChart;