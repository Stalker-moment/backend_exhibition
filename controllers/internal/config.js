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

  if(!production || !time){
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

    if (decoded.expired < Date.now()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //get last data oeeConfig
    let oeeConfig = await prisma.oeeConfig.findFirst({
      orderBy: {
        id: 1,
      },
    });

    //if production/time kosong maka isi value terakhir database, jika berisi maka di perbarui valuenya
    if (production) {
      oeeConfig.targetProduction = production;
    }

    if (time) {
      oeeConfig.targetCycleTimeOK = time;
      oeeConfig.targetCycleTimeNG = time;
    }

    //create 6 digit id random :
    let idNow = Math.floor(100000 + Math.random() * 900000);
    oeeConfig.idNow = idNow;

    //update oeeConfig
    await prisma.oeeConfig.update({
      where: {
        id: oeeConfig.id,
      },
      data: {
        idNow: oeeConfig.idNow,
        production: oeeConfig.production,
        time: oeeConfig.time,
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

  if(!current || !pressure){
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

    if (decoded.expired < Date.now()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    //get all account include contact
    let accounts = await prisma.account.findMany({
      include: {
        contact: true,
      },
    });

    //get last data oeeConfig
    let oeeConfig = await prisma.oeeConfig.findFirst({
      orderBy: {
        id: 1,
      },
    });

    //if current/pressure kosong maka isi value terakhir database, jika berisi maka di perbarui valuenya
    if (current) {
      oeeConfig.current = current;
    }

    if (pressure) {
      oeeConfig.pressure = pressure;
    }

    //update oeeConfig
    await prisma.oeeConfig.update({
      where: {
        id: oeeConfig.id,
      },
      data: {
        current: oeeConfig.current,
        pressure: oeeConfig.pressure,
      },
    });

    return res.status(200).json({ message: "Success", data: oeeConfig });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
