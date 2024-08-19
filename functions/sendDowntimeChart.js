const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch logs filtered by a specific date or return all logs.
 * @param {Date|null} filterDate - The date to filter logs by. If null, fetch logs for today.
 * @returns {Promise<Object>} - A promise that resolves to an object with LabelId, DownTime, DownTimeStr, totalDownTime, and totalDownTimeStr.
 */

async function sendDowntimeChart(filterDate = null) {
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

    // Collect unique idNow values
    let idNow = [];
    downTime.forEach((item) => {
      if (!idNow.includes(item.idNow)) {
        idNow.push(item.idNow);
      }
    });

    // Sum timeDown for each idNow
    let timeDown = [];
    let totalDownTime = 0;
    idNow.forEach((id) => {
      let sum = 0;
      downTime.forEach((item) => {
        if (item.idNow == id) {
          sum += item.timeDown;
          totalDownTime += item.timeDown; // Add to total downtime
        }
      });
      timeDown.push(sum);
    });

    // Convert timeDown to hh:mm:ss format
    let timeDownFormat = timeDown.map((time) => {
      let hours = Math.floor(time / 3600000);
      let minutes = Math.floor((time % 3600000) / 60000);
      let seconds = Math.floor((time % 60000) / 1000);
      return `${hours}:${minutes}:${seconds}`;
    });

    // Convert totalDownTime to hh:mm:ss format
    let totalDownTimeStr = (() => {
      let hours = Math.floor(totalDownTime / 3600000);
      let minutes = Math.floor((totalDownTime % 3600000) / 60000);
      let seconds = Math.floor((totalDownTime % 60000) / 1000);
      return `${hours}:${minutes}:${seconds}`;
    })();

    // Return the result in the desired format
    return {
      LabelId: idNow,
      DownTime: timeDown,
      DownTimeStr: timeDownFormat,
      totalDownTime: totalDownTime,
      totalDownTimeStr: totalDownTimeStr
    };

  } catch (error) {
    console.error("Error fetching downTime:", error);
    throw error;
  }
}

module.exports = sendDowntimeChart;