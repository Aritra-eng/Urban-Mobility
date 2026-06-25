const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/:driverId", transactionController.getTransactions);

module.exports = router;