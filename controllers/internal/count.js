const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/count/:type/:step", async (req, res) => {
  const type = parseInt(req.params.type);
  const step = parseInt(req.params.step);

  if (type !== 1 && type !== 0) {
    return res.status(400).json({ error: "Invalid type value" });
  }

  if (step !== 1 && step !== 2) {
    return res.status(400).json({ error: "Invalid step value" });
  }

  try {
    // Get idNow from oeeConfig
    const DataBefore = await prisma.oeeConfig.findFirst();
    if (!DataBefore) {
      console.error("oeeConfig data not found. IDNOW is empty.");
      return res.status(400).json({ error: "oeeConfig data not found" });
    }
    const IDNOW = DataBefore.idNow;

    // Get the latest process value for the current idNow
    const ProcessNow = await prisma.oeeProcess.findFirst({
      where: { idNow: IDNOW },
      orderBy: { process: "desc" },
    });

    if (step === 1) {
      // Check if the last process has an endTime
      if (ProcessNow && ProcessNow.endTime === null) {
        return res
          .status(400)
          .json({ error: "Previous process has not ended yet" });
      }

      // Check if the target production has been reached
      if (ProcessNow && DataBefore.targetProduction === ProcessNow.process) {
        return res
          .status(400)
          .json({ error: "Target production has been reached" });
      }

      // Create new count with startTime
      const oeeProcess = await prisma.oeeProcess.create({
        data: {
          idNow: IDNOW,
          process: ProcessNow ? ProcessNow.process + 1 : 1,
          target: DataBefore.targetProduction,
          startTime: new Date(),
        },
      });

      return res.status(200).json({
        message: "Process started successfully",
        oeeProcess,
      });
    }

    if (step === 2) {
      // Check if the last process has a startTime and no endTime
      if (!ProcessNow || ProcessNow.endTime !== null) {
        return res.status(400).json({ error: "No ongoing process to end" });
      }

      const endTime = new Date();
      const processTime = Math.floor((endTime - ProcessNow.startTime) / 1000); // in seconds

      // Update the process with endTime and processTime
      const oeeProcess = await prisma.oeeProcess.update({
        where: { id: ProcessNow.id },
        data: {
          endTime,
          processTime,
          isOK: type === 1,
        },
      });

      return res.status(200).json({
        message: "Process ended successfully",
        oeeProcess,
      });
    }
  } catch (err) {
    console.error("Internal server error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
