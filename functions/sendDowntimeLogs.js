const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch logs filtered by a specific date or return all logs.
 * Convert timeStart into time and date fields.
 * @param {Date|null} filterDate - The date to filter logs by. If null, fetch logs for today.
 * @returns {Promise<Array>} - A promise that resolves to an array of logs with formatted time and date.
 */

async function sendDowntimeLogs(filterDate = null) {
  try {
    let downTime;
    
    if (filterDate) {
      const startOfDay = new Date(filterDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(filterDate);
      endOfDay.setHours(23, 59, 59, 999);

      downTime = await prisma.downTime.findMany({
        where: {
          timeStart: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        orderBy: {
          timeStart: 'desc'
        }
      });
    } else {
      const today = new Date();
      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      downTime = await prisma.downTime.findMany({
        where: {
          timeStart: {
            gte: startOfToday,
            lte: endOfToday
          }
        },
        orderBy: {
          timeStart: 'desc'
        }
      });
    }

    // Format the timeStart into time and date fields
    downTime = downTime.map(log => {
      const timeStart = new Date(log.timeStart);
      const hours = timeStart.getHours().toString().padStart(2, '0');
      const minutes = timeStart.getMinutes().toString().padStart(2, '0');
      const seconds = timeStart.getSeconds().toString().padStart(2, '0');
      const time = `${hours}:${minutes}:${seconds}`;

      const day = timeStart.getDate().toString().padStart(2, '0');
      const month = (timeStart.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
      const year = timeStart.getFullYear();
      const date = `${day}:${month}:${year}`;

      return {
        ...log,
        time,
        date,
      };
    });

    return downTime;
  } catch (error) {
    console.error("Error fetching downTime:", error);
    throw error; 
  }
}

module.exports = sendDowntimeLogs;