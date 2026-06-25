const db = require("../config/db");

exports.getFuelStations = (req, res) => {
  db.query(
    "SELECT * FROM fuelstations ORDER BY distance ASC",
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};