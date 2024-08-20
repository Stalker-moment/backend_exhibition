const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendProcess() {
  try {
    //get IDNow
    const DataBefore = await prisma.oeeConfig.findFirst();
    const IDNOW = DataBefore.idNow;

    // Fetch all logs by IDNow
    let logs = await prisma.oeeProcess.findMany({
      where: {
        idNow: IDNOW,
      },
    });

    // Log the fetched logs to inspect their structure
    console.log("Fetched logs:", logs);

    if (logs.length === 0) {
      return { message: "No process found for today" };
    }

    // Process each log entry and determine the status
    logs = logs.map((log) => {
      return {
        id: log.id,
        idNow: log.idNow,
        process: log.process,
        target: log.target,
        startTime: log.startTime,
        endTime: log.endTime,
        processTime: log.processTime,
        status: determineStatus(log.isOK), // Determine the status based on isOK
      };
    });

    return logs;
  } catch (error) {
    console.error("Error fetching latest logs:", error);
    throw error;
  }
}

// Helper function to determine status
function determineStatus(isOK) {
  if (isOK === true) {
    return "L40";
  } else if (isOK === false) {
    return "L30";
  } else {
    return "Process";
  }
}

module.exports = sendProcess;
