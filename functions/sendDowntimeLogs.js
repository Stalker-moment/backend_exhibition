const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch logs filtered by a specific date or return all logs.
 * @param {Date|null} filterDate - The date to filter logs by. If null, fetch logs for today.
 * @returns {Promise<Array>} - A promise that resolves to an array of logs.
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

    return downTime;
  } catch (error) {
    console.error("Error fetching downTime:", error);
    throw error; 
  }
}

module.exports = sendDowntimeLogs;