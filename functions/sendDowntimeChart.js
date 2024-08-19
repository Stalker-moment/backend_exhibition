const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch logs filtered by a specific month or return all logs for the month.
 * @param {Date|null} filterDate - The date to filter logs by. If null, fetch logs for the current month.
 * @returns {Promise<Object>} - A promise that resolves to an object with date and data arrays.
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

    // Collect all dates of the month
    let dates = [];
    let currentDate = new Date(startOfMonth);

    while (currentDate <= endOfMonth) {
      dates.push(currentDate.toISOString().split('T')[0]); // Format: YYYY-MM-DD
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Initialize the data array with zeros for each date
    const data = new Array(dates.length).fill(0);

    // Sum timeDown for each date
    downTime.forEach((item) => {
      const date = item.timeStart.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const index = dates.indexOf(date);
      if (index !== -1) {
        data[index] += item.timeDown;
      }
    });

    // Convert total downtime to hours, minutes, and seconds for each day
    const formattedData = data.map((time) => {
      let hours = Math.floor(time / 3600000);
      let minutes = Math.floor((time % 3600000) / 60000);
      let seconds = Math.floor((time % 60000) / 1000);
      return `${hours}:${minutes}:${seconds}`;
    });

    // Return the result in the desired format
    return {
      date: dates,
      data: formattedData
    };

  } catch (error) {
    console.error("Error fetching downTime:", error);
    throw error;
  }
}

module.exports = sendDowntimeChart;