const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/", async (req, res) => {
  return res.json({ message: "welcome to kflix" });
});

app.use("/api/auth", authRoutes);
app.use("/api/watchlist", watchlistRoutes);

module.exports = app;
