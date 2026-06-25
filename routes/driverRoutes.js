const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");

router.get("/:id", driverController.getDriverById);

module.exports = router;