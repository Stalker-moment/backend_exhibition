const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const dotenv = require("dotenv");
dotenv.config();

router.post("/config/new", async (req, res) => {
  const production = parseInt(req.body.production);
  const time = parseInt(req.body.time);
  const { authorization } = req.headers;

  if (!production || !time) {
    return res.status(400).json({ error: "Bad Request" });
  }

  try {
    if (!authorization) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (decoded.exp < Date.now()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Mendapatkan data terakhir dari oeeConfig
    let oeeConfig = await prisma.oeeConfig.findFirst({
      where: { id: 1 } // Mengambil data dengan ID 1
    });

    // Menggunakan upsert untuk memperbarui atau membuat entri baru
    oeeConfig = await prisma.oeeConfig.upsert({
      where: { id: 1 }, // Menggunakan ID 1
      update: {
        targetProduction: production || oeeConfig.targetProduction,
        targetCycleTimeOK: time || oeeConfig.targetCycleTimeOK,
        targetCycleTimeNG: time || oeeConfig.targetCycleTimeNG,
        idNow: Math.floor(100000 + Math.random() * 900000), // Membuat ID 6 digit baru
      },
      create: {
        targetProduction: production,
        targetCycleTimeOK: time,
        targetCycleTimeNG: time,
        idNow: Math.floor(100000 + Math.random() * 900000),
      },
    });

    return res.status(200).json({ message: "Success", data: oeeConfig });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/config/sensor", async (req, res) => {
  const { authorization } = req.headers;
  const current = parseFloat(req.body.current);
  const pressure = parseFloat(req.body.pressure);

  if (!current || !pressure) {
    return res.status(400).json({ error: "Bad Request" });
  }

  try {
    if (!authorization) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (decoded.exp < Date.now()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Mendapatkan data terakhir dari oeeConfig
    let oeeConfig = await prisma.oeeConfig.findFirst({
      where: { id: 1 } // Mengambil data dengan ID 1
    });

    // Menggunakan upsert untuk memperbarui atau membuat entri baru
    oeeConfig = await prisma.oeeConfig.upsert({
      where: { id: 1 }, // Menggunakan ID 1
      update: {
        current: current || oeeConfig.current,
        pressure: pressure || oeeConfig.pressure,
      },
      create: {
        current: current,
        pressure: pressure,
      },
    });

    return res.status(200).json({ message: "Success", data: oeeConfig });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;