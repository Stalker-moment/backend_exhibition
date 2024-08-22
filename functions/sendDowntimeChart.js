const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch logs filtered by a specific month or return all logs for the month.
 * @param {Date|null} filterDate - The date to filter logs by. If null, fetch logs for the current month.
 * @returns {Promise<Object>} - A promise that resolves to an object with date, data (string format), and dataMinutes (integer format) arrays.
 */
async function sendDowntimeChart(filterDate = null) {
  try {
    let downTime;

    // Determine the start and end of the month based on the filterDate
    let startOfMonth;
    let endOfMonth;

    if (filterDate) {
      startOfMonth = new Date(filterDate.getFullYear(), filterDate.getMonth(), 1);
      endOfMonth = new Date(filterDate.getFullYear(), filterDate.getMonth() + 1, 0, 23, 59, 59, 999);
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

    // Accumulate downtime for each date
    const dateToSecondsMap = new Map();

    downTime.forEach((item) => {
      const date = item.timeStart.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const downtimeMillis = item.timeDown || 0; // Default to 0 if timeDown is null or undefined
      const seconds = Math.floor(downtimeMillis / 1000); // Convert to full seconds

      if (dateToSecondsMap.has(date)) {
        dateToSecondsMap.set(date, dateToSecondsMap.get(date) + seconds);
      } else {
        dateToSecondsMap.set(date, seconds);
      }
    });

    // Prepare the date array for the entire month
    const dates = [];
    const dataMinutes = [];
    const dataSeconds = [];
    for (let day = 1; day <= new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).getDate(); day++) {
      const date = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(date);

      // Get accumulated seconds or default to 0 if no data
      const totalSeconds = dateToSecondsMap.get(date) || 0;
      dataSeconds.push(totalSeconds);
      dataMinutes.push(Math.floor(totalSeconds / 60));
    }

    // Convert downtime to HH:MM:SS format
    const convertToTimeFormat = (totalSeconds) => {
      let hours = Math.floor(totalSeconds / 3600);
      let minutes = Math.floor((totalSeconds % 3600) / 60);
      let seconds = Math.floor(totalSeconds % 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const formattedData = dataSeconds.map(seconds => convertToTimeFormat(seconds));

    // Return the result in the desired format
    return {
      date: dates,
      data: formattedData, // String format: HH:MM:SS
      dataMinutes: dataMinutes, // Integer format for minutes
      dataSeconds: dataSeconds  // Integer format for seconds
    };

  } catch (error) {
    console.error("Error fetching downTime:", error);
    throw error;
  }
}

module.exports = sendDowntimeChart;