const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// async function sendCommand() {
//   try {
//     // Fetch the most recent log entry
//     let latestLog = await prisma.logs.findFirst({
//       orderBy: {
//         timestamp: 'desc', // Sort by timestamp in descending order
//       },
//     });

//     // Check if a log entry exists
//     if (!latestLog) {
//       throw new Error('No logs found');
//     }

//     latestLog = {
//         available: latestLog.available,
//         used: latestLog.used,
//         total: latestLog.total,
//         timestamp: latestLog.timestamp
//     };

//     return latestLog; // Return the latest log entry
//   } catch (error) {
//     console.error("Error fetching latest log:", error);
//     throw error;
//   }
// }

async function sendCommanddumy() {
  try {
    dummyData = {
      AutoButton: true,
      FaultReset: false,
      StopButton: true,
      MasterOn: true,
    };

    return dummyData; // Return the latest log entry
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendCommanddumy;
