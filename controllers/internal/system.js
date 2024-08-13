const express = require("express");
const router = express.Router();

router.get(
  "/system/:power/:plc_running/:air/:machiningcomp/:PLCBattAlarmn/:CycleTimeOver/:PartJudgementFault",
  (req, res) => {
    const {
      plc_running,
      air,
      machiningcomp,
      PLCBattAlarmn,
      CycleTimeOver,
      PartJudgementFault,
    } = req.params;

    console.log(req.params);

    return res.status(200).json({
      code: 200,
      message: "Value Updated",
    });
  }
);

module.exports = router;
