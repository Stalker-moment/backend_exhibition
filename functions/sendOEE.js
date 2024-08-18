const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function sendOEE() {
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

    //get all value with IDNow at DownTime
    const downTime = await prisma.downTime.findMany({
      where: {
        idNow: IDNOW,
      },
    });

    //hitung quality
    let OK = 0;
    let NG = 0;

    const total = oeeProcess.length;

    for (let i = 0; i < oeeProcess.length; i++) {
      if (oeeProcess[i].isOK === null) {
        //do nothing
      } else if (oeeProcess[i].isOK === true) {
        OK++;
      } else {
        NG++;
      }
    }

    let quality = OK / total;

    //hitung performance
    const idealTime = DataBefore.targetCycleTimeOK;
    let totalCycleTime = 0;

    for (let i = 0; i < oeeProcess.length; i++) {
      totalCycleTime += oeeProcess[i].processTime;
    }

    let performance = (idealTime * total) / totalCycleTime;

    //hitung availability
    const totalTime = DataBefore.targetCycleTimeNG * total;
    let totalDownTime = 0;

    for (let i = 0; i < downTime.length; i++) {
      totalDownTime += downTime[i].timeDown;
    }

    let downtimemstosecond = totalDownTime / 1000;

    let availability = (totalTime - downtimemstosecond) / totalTime;

    if (quality > 1) {
      quality = 1;
    }

    if (performance > 1) {
      performance = 1;
    }

    if (availability > 1) {
      availability = 1;
    }

    //hitung OEE
    let OEE = quality * performance * availability;

    //convert ke persen
    quality = quality * 100;
    performance = performance * 100;
    availability = availability * 100;
    OEE = OEE * 100;

    //detect percent have decimal or not
    if (quality % 1 === 0) {
      quality = quality;
    } else {
      quality = quality.toFixed(2);
    }

    if (performance % 1 === 0) {
      performance = performance;
    } else {
      performance = performance.toFixed(2);
    }

    if (availability % 1 === 0) {
      availability = availability;
    } else {
      availability = availability.toFixed(2);
    }

    if (OEE % 1 === 0) {
      OEE = OEE;
    } else {
      OEE = OEE.toFixed(2);
    }

    const unit = "%";

    const jsonOEE = {
      quality,
      performance,
      availability,
      OEE,
      unit,
    };

    return jsonOEE; // Return the latest log entry
  } catch (error) {
    console.error("Error fetching latest log:", error);
    throw error;
  }
}

module.exports = sendOEE;
