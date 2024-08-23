const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const sendCurrentSensor = require("../../functions/sendCurrentSensor");

async function parseBoolean(value) {
  // Check if the value is a boolean true (1) or false (0)
  if (value === "1" || value === "true") {
    return true;
  } else if (value === "0" || value === "false") {
    return false;
  } else {
    return null;
  }
}

router.get(
  "/system/:power/:DownTime/:air/:machiningcomp/:L40Parts/:L30Parts/:PLCRun/:MasterOn",
  async (req, res) => {
    let power = await parseBoolean(req.params.power);
    let DownTime = await parseBoolean(req.params.DownTime);
    let air = await parseBoolean(req.params.air);
    let machiningcomp = await parseBoolean(req.params.machiningcomp);
    let L40Parts = await parseBoolean(req.params.L40Parts);
    let L30Parts = await parseBoolean(req.params.L30Parts);
    let PLCRun = await parseBoolean(req.params.PLCRun);
    let MasterOn = await parseBoolean(req.params.MasterOn);

    if (
      power === null ||
      DownTime === null ||
      air === null ||
      machiningcomp === null ||
      L40Parts === null ||
      L30Parts === null ||
      PLCRun === null ||
      MasterOn === null
    ) {
      return res.status(400).json({ error: "Invalid value" });
    }

    try {
      const dataPlc = await prisma.dataPlc.upsert({
        where: { id: 1 },
        update: {
          Power: power,
          DownTime: DownTime,
          Air: air,
          MachiningComp: machiningcomp,
          L40Parts: L40Parts,
          L30Parts: L30Parts,
          PLCRun: PLCRun,
          MasterOn: MasterOn,
        },
        create: {
          Power: power,
          DownTime: DownTime,
          Air: air,
          MachiningComp: machiningcomp,
          L40Parts: L40Parts,
          L30Parts: L30Parts,
          PLCRun: PLCRun,
          MasterOn: MasterOn,
        },
      });

      return res.status(200).json({
        message: "Data Plc updated successfully",
        dataPlc,
      });
    } catch (error) {
      console.error("Error in Prisma operation:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/get/current", async (req, res) => {
  try {
    const sensor = await sendCurrentSensor();
    return res.status(200).json(sensor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/get/button", async (req, res) => {
  try {
    const configuration = await prisma.configuration.findFirst();
    return res.status(200).json({ configuration });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sensor/:pressure", async (req, res) => {
  let pressure = parseFloat(req.params.pressure);

  if (
    // Check if any of the values are null
    pressure === null
  ) {
    return res.status(400).json({ error: "Invalid value" });
  }

  const sensor = await sendCurrentSensor();
  let current = 0;

  // Check if the sensor data and status array exist
  if (sensor && sensor.result && sensor.result.status) {
    // Find the status object with the code "cur_current"
    const currentStatus = sensor.result.status.find(
      (item) => item.code === "cur_current"
    );

    // Extract the current value if it exists
    current = currentStatus ? currentStatus.value : 0;

    console.log("Current value:", current);
  } else {
    console.error(
      "Sensor data is not available or does not have status information."
    );
    current = 0;
  }

  const thresholds = 0.05;

  //if value current/pressure less than 0.02 make it 0.00
  if (pressure < thresholds) {
    pressure = 0.0;
  }

  try {
    //check value before update
    const DataBefore = await prisma.sensor.findFirst();

    const sensor = await prisma.sensor.upsert({
      where: { id: 1 }, // Using ID 1 for a single sensor scenario
      update: {
        Current: current,
        Pressure: pressure,
      },
      create: {
        Current: current,
        Pressure: pressure,
      },
    });

    const sensorLog = await prisma.sensorLog.create({
      data: {
        Current: current,
        Pressure: pressure,
      },
    });

    return res.status(200).json({
      message: "Data sensor updated successfully",
      sensor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/switch/auto", async (req, res) => {
  let value = req.body.value;

  if (value === null) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.configuration.findFirst();

    const configuration = await prisma.configuration.upsert({
      where: { id: 1 }, // Using ID 1 for a single configuration scenario
      update: {
        AutoButton: value,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: DataBefore.StopButton,
        MasterOnButton: DataBefore.MasterOnButton,
      },
      create: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: DataBefore.StopButton,
        MasterOnButton: DataBefore.MasterOnButton,
      },
    });

    return res.status(200).json({
      message: "Data configuration updated successfully",
      configuration,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/switch/fault-reset", async (req, res) => {
  let value = req.body.value;

  if (value === null) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.configuration.findFirst();

    const configuration = await prisma.configuration.upsert({
      where: { id: 1 }, // Using ID 1 for a single configuration scenario
      update: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: value,
        StopButton: DataBefore.StopButton,
        MasterOnButton: DataBefore.MasterOnButton,
      },
      create: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: value,
        StopButton: DataBefore.StopButton,
        MasterOnButton: DataBefore.MasterOnButton,
      },
    });

    return res.status(200).json({
      message: "Data configuration updated successfully",
      configuration,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/switch/stop", async (req, res) => {
  let value = req.body.value;

  if (value === null) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.configuration.findFirst();

    const configuration = await prisma.configuration.upsert({
      where: { id: 1 }, // Using ID 1 for a single configuration scenario
      update: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: value,
        MasterOnButton: DataBefore.MasterOnButton,
      },
      create: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: value,
        MasterOnButton: DataBefore.MasterOnButton,
      },
    });

    return res.status(200).json({
      message: "Data configuration updated successfully",
      configuration,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/switch/master-on", async (req, res) => {
  let value = req.body.value;

  if (value === null) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.configuration.findFirst();

    const configuration = await prisma.configuration.upsert({
      where: { id: 1 }, // Using ID 1 for a single configuration scenario
      update: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: DataBefore.StopButton,
        MasterOnButton: value,
      },
      create: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: DataBefore.StopButton,
        MasterOnButton: value,
      },
    });

    return res.status(200).json({
      message: "Data configuration updated successfully",
      configuration,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//======================[CALLBACK]======================

router.get("/switch/reverse/auto/:value", async (req, res) => {
  let value = await parseBoolean(req.params.value);

  if (value === null) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.configuration.findFirst();

    const configuration = await prisma.configuration.upsert({
      where: { id: 1 }, // Using ID 1 for a single configuration scenario
      update: {
        AutoButton: value,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: DataBefore.StopButton,
        MasterOnButton: DataBefore.MasterOnButton,
      },
      create: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: DataBefore.StopButton,
        MasterOnButton: DataBefore.MasterOnButton,
      },
    });

    return res.status(200).json({
      message: "Data configuration updated successfully",
      configuration,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/switch/reverse/fault-reset/:value", async (req, res) => {
  let value = await parseBoolean(req.params.value);

  if (value === null) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.configuration.findFirst();

    const configuration = await prisma.configuration.upsert({
      where: { id: 1 }, // Using ID 1 for a single configuration scenario
      update: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: value,
        StopButton: DataBefore.StopButton,
        MasterOnButton: DataBefore.MasterOnButton,
      },
      create: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: value,
        StopButton: DataBefore.StopButton,
        MasterOnButton: DataBefore.MasterOnButton,
      },
    });

    return res.status(200).json({
      message: "Data configuration updated successfully",
      configuration,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/switch/reverse/stop/:value", async (req, res) => {
  let value = await parseBoolean(req.params.value);

  if (value === null) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.configuration.findFirst();

    const configuration = await prisma.configuration.upsert({
      where: { id: 1 }, // Using ID 1 for a single configuration scenario
      update: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: value,
        MasterOnButton: DataBefore.MasterOnButton,
      },
      create: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: value,
        MasterOnButton: DataBefore.MasterOnButton,
      },
    });

    return res.status(200).json({
      message: "Data configuration updated successfully",
      configuration,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/switch/reverse/master-on/:value", async (req, res) => {
  let value = await parseBoolean(req.params.value);

  if (value === null) {
    return res.status(400).json({ error: "Invalid value" });
  }

  try {
    //check value before update
    const DataBefore = await prisma.configuration.findFirst();

    const configuration = await prisma.configuration.upsert({
      where: { id: 1 }, // Using ID 1 for a single configuration scenario
      update: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: DataBefore.StopButton,
        MasterOnButton: value,
      },
      create: {
        AutoButton: DataBefore.AutoButton,
        FaultResetButton: DataBefore.FaultResetButton,
        StopButton: DataBefore.StopButton,
        MasterOnButton: value,
      },
    });

    return res.status(200).json({
      message: "Data configuration updated successfully",
      configuration,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
