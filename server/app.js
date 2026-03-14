const express = require("express");
const app = express();
const cors = require("cors");

// setup middleware
app.use(cors("*"));
app.use(express.json());

app.get("/", async (req, res, next) => {
  return res.json({ message: "welcome to kflix" });
});

module.exports = app;
