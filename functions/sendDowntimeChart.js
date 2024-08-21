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

    // Collect unique dates
    let dateSet = new Set();
    downTime.forEach((item) => {
      const date = item.timeStart.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      dateSet.add(date);
    });

    // Prepare the date array for the entire month
    const dates = [];
    for (let day = 1; day <= new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0).getDate(); day++) {
      const date = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      dates.push(date);
    }

    // Initialize the data arrays
    const dataMinutes = dates.map(() => 0); // Integer format for minutes

    // Accumulate downtime for each date
    downTime.forEach((item) => {
      const date = item.timeStart.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const index = dates.indexOf(date);
      if (index !== -1) {
        const timeDown = item.timeDown; // Assume timeDown is in milliseconds
        const minutes = Math.round(timeDown / 60000 * 2) / 2; // Convert to minutes, round to nearest 0.5 minutes
        dataMinutes[index] += Math.floor(timeDown / 60000); // Accumulate total downtime in minutes
      }
    });

    // Convert downtime to HH:MM:SS format
    const convertToTimeFormat = (totalMinutes) => {
      let totalSeconds = totalMinutes * 60;
      let hours = Math.floor(totalSeconds / 3600);
      let minutes = Math.floor((totalSeconds % 3600) / 60);
      let seconds = Math.floor(totalSeconds % 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const formattedData = dataMinutes.map(minutes => convertToTimeFormat(minutes));

    // Return the result in the desired format
    return {
      date: dates,
      data: formattedData, // String format: HH:MM:SS
      dataMinutes: dataMinutes // Integer format for minutes
    };

  } catch (error) {
    console.error("Error fetching downTime:", error);
    throw error;
  }
}

module.exports = sendDowntimeChart;