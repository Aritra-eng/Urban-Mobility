const db = require("../config/db");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid username or password"
                });
            }

            const token = jwt.sign(
                {
                    driverId: results[0].driver_id,
                    username: results[0].username
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h"
                }
            );

            res.json({
                message: "Login successful",
                token,
                driverId: results[0].driver_id
            });
        }
    );
};