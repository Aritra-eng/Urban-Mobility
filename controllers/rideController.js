const db = require("../config/db");

exports.getAllRides = (req, res) => {
  db.query(
    "SELECT * FROM ridesuggestions ORDER BY score DESC",
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};