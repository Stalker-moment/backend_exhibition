const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function parseBoolean(value) {
  if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  }
  return null;
}

router.get("/downtime/:state", async (req, res) => {
  let state = await parseBoolean(req.params.state);

  console.log(state);

  if (state === null) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    // Get value from oeeConfig
    const DataBefore = await prisma.oeeConfig.findFirst();
    const IDNOW = DataBefore.idNow;

    let TimeNow = new Date();
    let TimeNowString = TimeNow.toISOString();

    // Search by IdNow
    const dataDownTime = await prisma.downTime.findFirst({
      where: {
        idNow: IDNOW,
      },
      orderBy: {
        timeStart: "desc", // Ensure that we get the latest downtime
      },
    });

    console.log(dataDownTime);

    if (state === true) {
      if (dataDownTime && dataDownTime.timeEnd === null) {
        return res.status(400).json({
          error:
            "An ongoing downtime already exists. Stop the current downtime before starting a new one.",
        });
      }

      // Create new downtime
      const downTime = await prisma.downTime.create({
        data: {
          idNow: IDNOW,
          timeStart: TimeNowString,
        },
      });

      //write downTime to oeeConfig
      await prisma.oeeConfig.update({
        where: {
          id: 1,
        },
        data: {
          onDownTime: true,
        },
      });

      return res.status(200).json({
        message: "Downtime started successfully",
        downTime,
      });
    } else {
      if (!dataDownTime || dataDownTime.timeEnd !== null) {
        return res
          .status(400)
          .json({ error: "No ongoing downtime found to stop." });
      }

      //write downTime to oeeConfig
      await prisma.oeeConfig.update({
        where: {
          id: 1,
        },
        data: {
          onDownTime: false,
        },
      });

      // Stop the current downtime
      const timeSTart = new Date(dataDownTime.timeStart);
      const timedown = TimeNow - timeSTart;

      const seconds = Math.floor(timedown / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const downTimeString = `${hours % 24} hours, ${minutes % 60} minutes, ${
        seconds % 60
      } seconds`;

      const downTime = await prisma.downTime.update({
        where: {
          id: dataDownTime.id,
        },
        data: {
          timeEnd: TimeNowString,
          timeDown: timedown,
          timeDownStr: downTimeString,
        },
      });

      return res.status(200).json({
        message: "Downtime stopped successfully",
        downTime,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
