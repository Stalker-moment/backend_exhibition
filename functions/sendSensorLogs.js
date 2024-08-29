const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch sensor logs filtered by a specific date or return all logs for the current day.
 * Convert timestamp into a string field in HH:MM:SS format.
 * Add indexCurrent and indexPressure based on thresholds.
 * @param {String|null} filterDate - The date to filter logs by in YYYY-MM-DD format. If null, fetch logs for the current day.
 * @returns {Promise<Array>} - A promise that resolves to an array of logs with formatted time, sensor data, and indexes.
 */
async function sendSensorLogs(filterDate = null) {
  try {
    let sensorLogs;

    // Check if filterDate is provided and is a string
    if (filterDate && typeof filterDate === 'string') {
      const [year, month, day] = filterDate.split("-").map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

      sensorLogs = await prisma.sensorLog.findMany({
        where: {
          timestamp: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 15 // Take the last 15 logs
      });
    } else {
      // Default to the current day
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

      sensorLogs = await prisma.sensorLog.findMany({
        where: {
          timestamp: {
            gte: startOfToday,
            lte: endOfToday
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 15 // Take the last 15 logs
      });
    }

    // Get maxCurrent and maxPressure from configuration
    const getConfiguration = await prisma.oeeConfig.findFirst();
    const maxCurrent = 150 + 100;
    const maxPressure = getConfiguration.maxPressure;

    // Format the timestamp into a time string in HH:MM:SS format and calculate indexes
    sensorLogs = sensorLogs.map(log => {
      const timestamp = new Date(log.timestamp);
      const hours = timestamp.getHours().toString().padStart(2, '0');
      const minutes = timestamp.getMinutes().toString().padStart(2, '0');
      const seconds = timestamp.getSeconds().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:${seconds}`;

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

      return {
        id: log.id,
        timestamp: formattedTime,
        Current: log.Current,
        indexCurrent: indexCurrent,
        Pressure: log.Pressure,
        indexPressure: indexPressure,
      };
    });

    return sensorLogs;
  } catch (error) {
    console.error("Error fetching sensorLogs:", error);
    throw error;
  }
}

module.exports = sendSensorLogs;