const express = require("express");
const router = express.Router();
const fuelController = require("../controllers/fuelController");

router.get("/", fuelController.getFuelStations);

module.exports = router;