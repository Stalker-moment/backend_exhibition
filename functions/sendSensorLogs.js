const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch sensor logs filtered by a specific date or return all logs for the current day.
 * Convert timestamp into a string field in HH:MM:SS format.
 * @param {String|null} filterDate - The date to filter logs by in YYYY-MM-DD format. If null, fetch logs for the current day.
 * @returns {Promise<Array>} - A promise that resolves to an array of logs with formatted time and sensor data.
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
        }
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
        }
      });
    }

    // Format the timestamp into a time string in HH:MM:SS format
    sensorLogs = sensorLogs.map(log => {
      const timestamp = new Date(log.timestamp);
      const hours = timestamp.getHours().toString().padStart(2, '0');
      const minutes = timestamp.getMinutes().toString().padStart(2, '0');
      const seconds = timestamp.getSeconds().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      return {
        id: log.id,
        timestamp: formattedTime,
        Current: log.Current,
        Pressure: log.Pressure,
      };
    });

    return sensorLogs;
  } catch (error) {
    console.error("Error fetching sensorLogs:", error);
    throw error;
  }
}

module.exports = sendSensorLogs;
