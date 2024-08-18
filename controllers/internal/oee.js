const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/oee/config/target-production", async (req, res) => {
  let { targetProduction } = parseInt(req.body);

  if (
    // Check if any of the values are null
    targetProduction === null
  ) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.oeeConfig.findFirst();

    const oeeConfig = await prisma.oeeConfig.upsert({
      where: { id: 1 }, // Using ID 1 for a single oeeConfig scenario
      update: {
        targetProduction: targetProduction,
      },
      create: {
        targetProduction: targetProduction,
      },
    });

    return res.status(200).json({
      message: "Data oeeConfig updated successfully",
      oeeConfig,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/oee/config/targetCycleTime", async (req, res) => {
  let { targetCycleTime } = parseInt(req.body);

  if (
    // Check if any of the values are null
    targetCycleTime === null
  ) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.oeeConfig.findFirst();

    const oeeConfig = await prisma.oeeConfig.upsert({
      where: { id: 1 }, // Using ID 1 for a single oeeConfig scenario
      update: {
        targetCycleTime: targetCycleTime,
      },
      create: {
        targetCycleTime: targetCycleTime,
      },
    });

    return res.status(200).json({
      message: "Data oeeConfig updated successfully",
      oeeConfig,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
