const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendOnline() {
  try {
    // Fetch the most recent log entry
    let latestConfig = await prisma.sensor.findFirst({
      orderBy: {
        id: "desc",
      },
    });

    //get Data from oeeConfig
    let DataBefore = await prisma.oeeConfig.findFirst();

    // Check if a log entry exists
    if (!latestConfig) {
      return { message: "No found" };
    }

    //get the last log (update time)
    let lastLog = latestConfig.updateAt;

    //get the current time
    let currentTime = new Date();

    //get downtime status
    let downtime = DataBefore.onDownTime;

    //get last data from downtime
    let downtimeData = await prisma.downTime.findFirst({
      orderBy: {
        id: "desc",
      },
    });

    let timeDifferenceHHMMSS = "00:00:00";

    if (!downtime) {
      timeDifferenceHHMMSS = "00:00:00";
    } else {
      //get time start downtime
      let timeStart = downtimeData.timeStart.getTime();

      //compare the time now and the time start downtime
      let timeDifference = currentTime - timeStart;

      //convert time difference to format HH:MM:SS
      let hours = Math.floor(timeDifference / 3600000);
      let minutes = Math.floor((timeDifference % 3600000) / 60000);
      let seconds = Math.floor((timeDifference % 60000) / 1000);

      timeDifferenceHHMMSS = `${hours}:${minutes}:${seconds}`;
    }

    //get the difference between the last log and the current time
    let difference = currentTime - lastLog;

    //check if the difference is greater than 10 seconds
    //console.log(difference);
    if (difference > 10000) {
      return {
        isOnline: false,
        downtime: false,
        time: timeDifferenceHHMMSS,
        message: "Machine Offline",
      };
    } else {
      return {
        isOnline: true,
        downtime,
        time: timeDifferenceHHMMSS,
        message: "Machine Online",
      };
    }
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendOnline;
