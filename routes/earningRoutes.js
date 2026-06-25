const express = require("express");
const router = express.Router();
const earningController = require("../controllers/earningController");

router.get("/:driverId", earningController.getEarnings);

module.exports = router;