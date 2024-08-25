const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendOutput() {
  try {
    //get IDNow
    const DataBefore = await prisma.oeeConfig.findFirst();
    const IDNOW = DataBefore.idNow;

    //get all value with IDNow at oeeProcess
    const oeeProcess = await prisma.oeeProcess.findMany({
      where: {
        idNow: IDNOW,
      },
    });

    //filter data oeeProcess yang isOK nya null tidak dihitung
    const oeeProcessFiltered = oeeProcess.filter((log) => {
      return log.isOK !== null;
    });

    //hitung quality
    let OK = 0;
    let NG = 0;
    let PROCESS = false;


    //get the last data from oeeProcess
    const oeeProcessLast = oeeProcessFiltered[oeeProcessFiltered.length - 1];

    const target = oeeProcessLast.target;
    const total = oeeProcessLast.process;

    const open = target - total;
    let percent = (total / target) * 100

    for (let i = 0; i < oeeProcessFiltered.length; i++) {
      if (oeeProcessFiltered[i].isOK === null) {
        PROCESS = true;
      } else if (oeeProcessFiltered[i].isOK === true) {
        OK++;
      } else {
        NG++;
      }
    }

    //detect percent have decimal or not
    if (percent % 1 === 0) {
      percent = percent;
    } else {
      percent = percent.toFixed(2);
    }

    const jsonOutput = {
      batchNumber: oeeProcessLast.idNow,
      percentage: percent,
      Done: total,
      Open: open,
      target: target,
      OK: OK,
      NG: NG,
      PROCESS: PROCESS,
    };

    console.log("Latest log entry:", jsonOutput);

    return jsonOutput; // Return the latest log entry
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendOutput;
