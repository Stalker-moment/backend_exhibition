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

    // Check if a log entry exists
    if (!latestConfig) {
      return { message: "No found" };
    }

    //get the last log (update time)
    let lastLog = latestConfig.updateAt;

    //get the current time
    let currentTime = new Date();

    //get the difference between the last log and the current time
    let difference = currentTime - lastLog;

    //check if the difference is greater than 10 seconds
    //console.log(difference);
    if (difference > 10000) {
      return { isOnline: false, message: "Machine Offline" };
    } else {
      return { isOnlineL:true, message: "Machine Online" };
    }
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendOnline;
