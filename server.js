require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const app = express();
const rideRoutes = require("./routes/rideRoutes");
const fuelRoutes = require("./routes/fuelRoutes");
const walletRoutes = require("./routes/walletRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const earningRoutes = require("./routes/earningRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");


app.use(cors());
app.use(express.json());
app.use("/rides", rideRoutes);
app.use("/fuel", fuelRoutes);
app.use("/wallet", walletRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/earnings", earningRoutes);
app.use("/transactions", transactionRoutes);
app.use("/auth", authRoutes);
const driverRoutes = require("./routes/driverRoutes");
app.use("/drivers", driverRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});