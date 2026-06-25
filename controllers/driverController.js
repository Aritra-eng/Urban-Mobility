const db = require("../config/db");

exports.getDriverById = (req, res) => {
    const id = req.params.id;

    db.query(
        "SELECT * FROM drivers WHERE driver_id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Driver not found"
                });
            }

            res.json(result[0]);
        }
    );
};