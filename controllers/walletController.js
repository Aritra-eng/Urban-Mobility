const db = require("../config/db");

exports.getWallet = (req, res) => {
  const driverId = req.params.driverId;

  db.query(
    "SELECT * FROM wallet WHERE driver_id = ?",
    [driverId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      
      res.json(results[0]);
    }
  );
};

exports.withdrawMoney = (req, res) => {
  const { driverId, amount } = req.body;

  if (!driverId || !amount || amount <= 0) {
    return res.status(400).json({
      message: "Valid driverId and amount are required"
    });
  }

  // Check wallet balance
  db.query(
    "SELECT balance FROM wallet WHERE driver_id = ?",
    [driverId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({
          message: "Wallet not found"
        });
      }

      const currentBalance = Number(results[0].balance);

      if (currentBalance < amount) {
        return res.status(400).json({
          message: "Insufficient balance"
        });
      }

      const newBalance = currentBalance - amount;

      // Update wallet
      db.query(
        "UPDATE wallet SET balance = ? WHERE driver_id = ?",
        [newBalance, driverId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Record transaction
          db.query(
            `INSERT INTO transactions
            (driver_id, amount, type, created_at)
            VALUES (?, ?, 'debit', NOW())`,
            [driverId, amount],
            (err) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              res.json({
                message: "Withdrawal successful",
                updated_balance: newBalance
              });
            }
          );
        }
      );
    }
  );
};