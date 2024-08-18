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

    //hitung quality
    let OK = 0;
    let NG = 0;


    //get the last data from oeeProcess
    const oeeProcessLast = oeeProcess[oeeProcess.length - 1];

    const target = oeeProcessLast.target;
    const total = oeeProcessLast.process;

    const open = target - total;
    let percent = (total / target) * 100

    for (let i = 0; i < oeeProcess.length; i++) {
      if (oeeProcess[i].isOK === null) {
        //do nothing
      } else if (oeeProcess[i].isOK === true) {
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
    };

    console.log("Latest log entry:", jsonOutput);

    return jsonOutput; // Return the latest log entry
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendOutput;
