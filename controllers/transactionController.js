const db = require("../config/db");

exports.getTransactions = (req, res) => {
  const driverId = req.params.driverId;

  db.query(
    `SELECT *
     FROM transactions
     WHERE driver_id = ?
     ORDER BY created_at DESC, txn_id DESC`,
    [driverId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results);
    }
  );
};