const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch logs filtered by a specific month or return all logs for the month.
 * Convert timeStart and timeEnd into string fields in HH:MM:SS format.
 * @param {String|null} filterMonth - The month to filter logs by in YYYY-MM format. If null, fetch logs for the current month.
 * @returns {Promise<Array>} - A promise that resolves to an array of logs with formatted time and date.
 */

async function sendDowntimeLogs(filterMonth = null) {
  try {
    let downTime;

    // Determine the start and end of the month based on the filterMonth
    let startOfMonth;
    let endOfMonth;

    if (filterMonth) {
      const [year, month] = filterMonth.split("-").map(Number);
      startOfMonth = new Date(year, month - 1, 1);
      endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      const today = new Date();
      startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    downTime = await prisma.downTime.findMany({
      where: {
        timeStart: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      orderBy: {
        timeStart: 'desc'
      }
    });

    // Format the timeStart and timeEnd into time strings in HH:MM:SS format
    downTime = downTime.map(log => {
      const timeStart = new Date(log.timeStart);
      const startHours = timeStart.getHours().toString().padStart(2, '0');
      const startMinutes = timeStart.getMinutes().toString().padStart(2, '0');
      const startSeconds = timeStart.getSeconds().toString().padStart(2, '0');
      const formattedTimeStart = `${startHours}:${startMinutes}:${startSeconds}`;

      let formattedTimeEnd = null;
      if (log.timeEnd) {
        const timeEnd = new Date(log.timeEnd);
        const endHours = timeEnd.getHours().toString().padStart(2, '0');
        const endMinutes = timeEnd.getMinutes().toString().padStart(2, '0');
        const endSeconds = timeEnd.getSeconds().toString().padStart(2, '0');
        formattedTimeEnd = `${endHours}:${endMinutes}:${endSeconds}`;
      }

      return {
        idNow: log.idNow,
        timeStart: formattedTimeStart,
        timeEnd: formattedTimeEnd,
        timeDownStr: log.timeDownStr,
        description: log.description,
      };
    });

    return downTime;
  } catch (error) {
    console.error("Error fetching downTime:", error);
    throw error;
  }
}

module.exports = sendDowntimeLogs;