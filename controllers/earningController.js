const db = require("../config/db");

exports.getEarnings = (req, res) => {
  const driverId = req.params.driverId;

  db.query(
    `SELECT *
     FROM earnings
     WHERE driver_id = ?
     ORDER BY earning_date DESC`,
    [driverId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results);
    }
  );
};