const express = require( "express");
const dotenv = require( "dotenv");
const uploadRoutes = require( "./routes/upload.js");
const cors = require("cors");
const mongoose = require("mongoose");


dotenv.config();

const app = express();
const PORT =  8086;
app.use(cors());

app.use(express.json());
app.use("/upload", uploadRoutes);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
