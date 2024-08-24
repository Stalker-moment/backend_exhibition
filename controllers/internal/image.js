const express = require("express");
const fs = require("fs");
const router = express.Router();
const path = require("path");

router.get("/img/:name", (req, res) => {
    const name = req.params.name;
    
    const filePath = `./img/${name}`;
    if (fs.existsSync(filePath)) {
        res.sendFile(path.resolve(filePath));
    } else {
        res.sendFile(path.resolve('./img/logo.png'));
    }
});

module.exports = router;