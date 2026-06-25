const db = require("../config/db");

exports.getDashboard = (req, res) => {
  const driverId = req.params.driverId;

  // Get driver details
  db.query(
    "SELECT * FROM drivers WHERE driver_id = ?",
    [driverId],
    (err, driverResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (driverResult.length === 0) {
        return res.status(404).json({ message: "Driver not found" });
      }

      // Get wallet details
      db.query(
        "SELECT * FROM wallet WHERE driver_id = ?",
        [driverId],
        (err, walletResult) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Get latest earnings
          db.query(
            `SELECT earnings, fuel_cost, net_profit
             FROM earnings
             WHERE driver_id = ?
             ORDER BY earning_date DESC
             LIMIT 1`,
            [driverId],
            (err, earningResult) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              res.json({
                driver: driverResult[0],
                wallet: walletResult[0] || null,
                latest_earning: earningResult[0] || null
              });
            }
          );
        }
      );
    }
  );
};