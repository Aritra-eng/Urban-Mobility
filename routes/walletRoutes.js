const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const walletController = require("../controllers/walletController");

// GET wallet details
router.get("/:driverId", auth, walletController.getWallet);

// POST withdraw money
router.post("/withdraw", auth, walletController.withdrawMoney);

module.exports = router;