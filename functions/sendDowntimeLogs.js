const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch logs filtered by a specific month or return all logs for the current month.
 * Convert timeStart into separate date and time fields in MM/DD/YYYY and HH:MM:SS formats.
 * Include timeEnd as a separate time field in HH:MM:SS format.
 * @param {String|null} filterMonth - The month to filter logs by in YYYY-MM format. If null, fetch logs for the current month.
 * @returns {Promise<Array>} - A promise that resolves to an array of logs with formatted time and date.
 */
async function sendDowntimeLogs(filterMonth = null) {
  try {
    let downTime;
    let startOfMonth, endOfMonth;

    // Calculate the start and end of the month based on filterMonth or current date
    if (filterMonth && typeof filterMonth === 'string') {
      const [year, month] = filterMonth.split("-").map(Number);
      startOfMonth = new Date(year, month - 1, 1);
      endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    } else {
      const today = new Date();
      startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Debug: Log the calculated dates
    console.log("Start of Month:", startOfMonth);
    console.log("End of Month:", endOfMonth);

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

    // Debug: Log the raw data fetched
    console.log("Raw Downtime Logs:", downTime);

    // Format the timeStart and timeEnd into separate date and time fields
    downTime = downTime.map(log => {
      const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      };

      const formatTime = (date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
      };

      const timeStart = new Date(log.timeStart);
      const dateStart = formatDate(timeStart);
      const timeStartFormatted = formatTime(timeStart);

      let timeEndFormatted = null;
      if (log.timeEnd) {
        const timeEnd = new Date(log.timeEnd);
        timeEndFormatted = formatTime(timeEnd);
      }

      return {
        idNow: log.idNow,
        dateStart: dateStart,
        timeStart: timeStartFormatted,
        timeEnd: timeEndFormatted,
        timeDownStr: log.timeDownStr,
        description: log.description,
      };
    });

    // Debug: Log the formatted data
    console.log("Formatted Downtime Logs:", downTime);

    return downTime;
  } catch (error) {
    console.error("Error fetching downTime:", error);
    throw error;
  }
}

module.exports = sendDowntimeLogs;