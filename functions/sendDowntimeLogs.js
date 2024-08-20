const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch logs filtered by a specific month or return all logs for the current month.
 * Convert timeStart into time and date fields.
 * @param {string|null} filterMonth - The month to filter logs by in 'YYYY-MM' format. If null, fetch logs for the current month.
 * @returns {Promise<Array>} - A promise that resolves to an array of logs with formatted time and date.
 */
async function sendDowntimeLogs(filterMonth = null) {
  try {
    let downTime;

    // Determine the start and end of the month based on the filterMonth
    let startOfMonth;
    let endOfMonth;

    if (filterMonth) {
      const [year, month] = filterMonth.split('-').map(Number);
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