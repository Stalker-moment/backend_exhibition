const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendProcess() {
  try {
    // Ambil data IDNow terbaru dari oeeConfig
    const dataBefore = await prisma.oeeConfig.findFirst({
      orderBy: {
        id: 'desc' // Mengambil data terbaru berdasarkan ID
      }
    });

    if (!dataBefore) {
      return [];
    }

    const idNow = dataBefore.idNow;

    // Ambil semua log berdasarkan IDNow terbaru
    let logs = await prisma.oeeProcess.findMany({
      where: {
        idNow: idNow,
      },
      orderBy: {
        startTime: 'desc' // Mengambil log terbaru berdasarkan waktu mulai
      }
    });

    // Log hasil log yang diambil untuk memeriksa strukturnya
    console.log("Fetched logs:", logs);

    if (logs.length === 0) {
      return { message: "No process found for the given IDNow" };
    }

    //if processTime before treshold maka jadikan waktu ke tresold
    logs = logs.map((log) => {
      if (log.processTime < 21) {
        log.processTime = 21;
      }
      return log;
    });

    // Proses setiap entri log dan tentukan status
    logs = logs.map((log) => {
      return {
        id: log.id,
        idNow: log.idNow,
        process: log.process,
        target: log.target,
        startTime: log.startTime,
        endTime: log.endTime,
        processTime: log.processTime,
        status: determineStatus(log.isOK), // Tentukan status berdasarkan isOK
      };
    });

    return logs;
  } catch (error) {
    console.error("Error fetching latest logs:", error);
    throw error;
  }
}

// Fungsi pembantu untuk menentukan status
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