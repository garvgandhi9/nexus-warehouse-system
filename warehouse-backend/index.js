const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const publicRoutes = require("./routes/publicRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/public", publicRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error("[SERVER] Unhandled error:", err.message);
  res.status(500).json({ success: false, error: "An unexpected error occurred. Please try again." });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`[SERVER] Nexus backend running on port ${PORT}`));