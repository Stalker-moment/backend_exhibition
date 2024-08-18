const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetch logs filtered by a specific date or return all logs.
 * @param {Date|null} filterDate - The date to filter logs by. If null, fetch logs for today.
 * @returns {Promise<Array>} - A promise that resolves to an array of logs.
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

    //kumpulkan idNow yang ada (berbeda) di downTime
    let idNow = [];
    downTime.forEach((item) => {
      if (!idNow.includes(item.idNow)) {
        idNow.push(item.idNow);
      }
    });

    //buat jumlahkan timeDown berdasarkan idNow
    let timeDown = [];
    idNow.forEach((id) => {
      let sum = 0;
      downTime.forEach((item) => {
        if (item.idNow == id) {
          sum += item.timeDown;
        }
      });
      timeDown.push(sum);
    });

    //convert timeDown ke format jam:menit:detik from milisecond
    let timeDownFormat = [];
    timeDown.forEach((time) => {
        let hours = Math.floor(time / 3600000);
        let minutes = Math.floor((time % 3600000) / 60000);
        let seconds = Math.floor((time % 60000) / 1000);
        let format = `${hours}:${minutes}:${seconds}`;

        timeDownFormat.push(format);
    });

    let result = [];
    for (let i = 0; i < idNow.length; i++) {
      result.push({
        idNow: idNow[i],
        timeDown: timeDownFormat[i]
      });
    }

    return result;

  } catch (error) {
    console.error("Error fetching downTime:", error);
    throw error; 
  }
}

module.exports = sendDowntimeChart;